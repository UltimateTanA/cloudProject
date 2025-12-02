import sagemaker
from sagemaker import get_execution_role
import boto3
import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split

# SageMaker session and role
sess = sagemaker.Session()
role = get_execution_role()

# Choose an S3 bucket (must already exist); or create one manually and put name here
bucket = sess.default_bucket()   # or: 'your-existing-bucket-name'
prefix = 'blazingtext-email-classifier'  # folder/prefix in the bucket

print("Bucket:", bucket)
print("Prefix:", prefix)

# Path to your local CSV
data_path = 'full_dataset.csv'  # change if needed

df = pd.read_csv(data_path)

# Quick sanity check
print(df.head())
print(df['category'].value_counts())

# Fill NaNs with empty strings
df['subject'] = df['subject'].fillna('')
df['body'] = df['body'].fillna('')

# Combine subject and body – you can choose your own format
df['text'] = df['subject'] + ' ' + df['body']
df['text'] = df['text'].str.replace('\n', ' ', regex=False)
df['text'] = df['text'].str.replace('\r', ' ', regex=False)

# Create the fastText-style labeled text
df['bt_format'] = '__label__' + df['category'].astype(str) + ' ' + df['text']

df[['bt_format']].head()

train_df, val_df = train_test_split(
    df['bt_format'],
    test_size=0.2,
    random_state=42,
    stratify=df['category']
)

print("Train samples:", len(train_df))
print("Validation samples:", len(val_df))

# Make local directories
os.makedirs('bt_data', exist_ok=True)

train_file = 'bt_data/train.txt'
validation_file = 'bt_data/validation.txt'

train_df.to_csv(train_file, index=False, header=False)
val_df.to_csv(validation_file, index=False, header=False)

!head -n 3 bt_data/train.txt

s3_train_path = sess.upload_data(path=train_file, bucket=bucket, key_prefix=f'{prefix}/data')
s3_validation_path = sess.upload_data(path=validation_file, bucket=bucket, key_prefix=f'{prefix}/data')

print("S3 train data path:", s3_train_path)
print("S3 validation data path:", s3_validation_path)

from sagemaker.amazon.amazon_estimator import get_image_uri

region = sess.boto_region_name

# For newer SDKs you may use sagemaker.image_uris.retrieve, but this works in many environments:
container = get_image_uri(region, 'blazingtext', 'latest')

print("BlazingText container:", container)

bt_estimator = sagemaker.estimator.Estimator(
    image_uri=container,
    role=role,
    instance_count=1,
    instance_type='ml.c4.4xlarge',  # adjust based on your quota/cost
    volume_size=30,
    max_run=3600,
    input_mode='File',
    output_path=f's3://{bucket}/{prefix}/output',
    sagemaker_session=sess
)

bt_estimator.set_hyperparameters(
    mode='supervised',    # classification
    epochs=5,            # tune as needed
    min_count=2,          # ignore rare words
    learning_rate=0.005,
    vector_dim=100,
    word_ngrams=2,        # bi-grams
    early_stopping=True,
    patience=4,
    min_epochs=5
)

from sagemaker.inputs import TrainingInput

train_data = TrainingInput(
    s3_data=s3_train_path,
    content_type='text/plain'
)

validation_data = TrainingInput(
    s3_data=s3_validation_path,
    content_type='text/plain'
)

data_channels = {
    'train': train_data,
    'validation': validation_data
}

bt_estimator.fit(inputs=data_channels)

# Deploy to a real-time endpoint
bt_predictor = bt_estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium',
    endpoint_name='blazingtext-email-classifier-endpoint'  # choose any unique name
)

bt_predictor.endpoint_name
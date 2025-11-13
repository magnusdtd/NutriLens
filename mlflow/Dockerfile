FROM python:3.11.11-slim

RUN apt-get -y update && apt-get install -y --no-install-recommends nginx

WORKDIR /opt/mlflow

RUN pip install mlflow==3.1.4

COPY mlruns /opt/ml/model
RUN python -c "from mlflow.models import container as C; C._install_pyfunc_deps('/opt/ml/model', install_mlflow=False, enable_mlserver=True, env_manager='local');"

ENV MLFLOW_DISABLE_ENV_CREATION=True
ENV ENABLE_MLSERVER=True

# granting read/write access and conditional execution authority to all child directories
# and files to allow for deployment to AWS Sagemaker Serverless Endpoints
# (see https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html)
RUN chmod o+rwX /opt/mlflow/

# clean up apt cache to reduce image size
RUN rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["python", "-c", "from mlflow.models import container as C; C._serve('local')"]

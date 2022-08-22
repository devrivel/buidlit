FROM public.ecr.aws/lambda/nodejs:16

COPY package.json ${LAMBDA_TASK_ROOT}
ADD dist ${LAMBDA_TASK_ROOT}

RUN npm install

CMD [ "main.handler" ]  
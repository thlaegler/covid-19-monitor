ARG BASE_IMAGE
FROM $BASE_IMAGE

ARG SERVICE_NAME

# Spring environment variables will be picked up by Spring Boot automatically
ENV SPRING_PROFILES_ACTIVE dev
ENV SPRING_CLOUD_CONFIG_LABEL master
ENV GOOGLE_APPLICATION_CREDENTIALS="/etc/config/service-account.json"

# Java options environment variable from base image in use
ENV JAVA_OPTS="-Xmx512 -server -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:+UseParallelGC"

EXPOSE 8080

ADD target/${SERVICE_NAME}-service.jar /app.jar
ADD service-account.json /etc/config/service-account.json

CMD java \
  $JAVA_OPTS \
  -Djava.security.egd=file:/dev/./urandom \
  -jar \
  /app.jar
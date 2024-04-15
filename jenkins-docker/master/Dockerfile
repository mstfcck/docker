FROM jenkins/jenkins:lts

#RUN /usr/local/bin/install-plugins.sh git mstest matrix-auth workflow-aggregator docker-workflow blueocean credentials-binding
RUN jenkins-plugin-cli --plugins git mstest matrix-auth workflow-aggregator docker-workflow blueocean credentials-binding pipeline-model-definition github-branch-source

ENV JENKINS_USER "admin"
ENV JENKINS_PASS "admin"

# Skip initial setup
ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false

COPY executors.groovy /usr/share/jenkins/ref/init.groovy.d/
COPY default-user.groovy /usr/share/jenkins/ref/init.groovy.d/

VOLUME /var/jenkins_home

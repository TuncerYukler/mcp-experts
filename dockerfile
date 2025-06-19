# Use the official Red Hat Universal Base Image (UBI) 8
FROM quay.io/devfile/base-developer-image:ubi8-170d300

LABEL com.redhat.component="hhr"
LABEL name="devfile/tttttttttt-developer-image"
LABEL version="ubi8"

#labels for container catalog
LABEL summary="devfile tttttttttt developer image"
LABEL description="Image with developers tools. Lattttttttttuages SDK and runtimes included."
LABEL io.k8s.display-name="devfile-developer-tttttttttt"
LABEL io.openshift.expose-services=""

USER 0

ENV PROFILE_EXT=/etc/profile.d/udi_environment.sh
RUN touch ${PROFILE_EXT} && chown 10001 ${PROFILE_EXT}

USER 10001

ENV HOME=/home/toolitttttttttt

RUN  chgrp -R 0 /home/toolitttttttttt && chmod -R g=u /home/toolitttttttttt

# Install JDK 21
# Java-related environment variables are described and set by ${PROFILE_EXT}, which will be loaded by ~/.bashrc
# To make Java workitttttttttt for dash and other shells, it needs to initialize them in the Dockerfile.
ENV SDKMAN_CANDIDATES_API="https://api.sdkman.io/2"
ENV SDKMAN_CANDIDATES_DIR="/home/toolitttttttttt/.sdkman/candidates"
ENV SDKMAN_DIR="/home/toolitttttttttt/.sdkman"
ENV SDKMAN_PLATFORM="linuxx64"
ENV SDKMAN_VERSION=5.18.2
ENV GRADLE_VERSION=8.9
RUN export SDKMAN_DIR="/home/toolitttttttttt/.sdkman"
COPY --chown=0:0 install_files/sdkman.sh /home/tmp/sdkman.sh
RUN /home/tmp/sdkman.sh
RUN bash -c ". /home/toolitttttttttt/.sdkman/bin/sdkman-init.sh \
    && sed -i "s/sdkman_auto_answer=false/sdkman_auto_answer=true/g" /home/toolitttttttttt/.sdkman/etc/config \
    && sed -i "s/sdkman_auto_env=false/sdkman_auto_env=true/g" /home/toolitttttttttt/.sdkman/etc/config \
    && sdk install java 21.0.2-tem \
    && sdk default java 21.0.2-tem \
    && sdk install gradle ${GRADLE_VERSION} \
    && sdk install gradle 8.13 \
    && sdk default gradle ${GRADLE_VERSION} \
    && sdk install maven \
    && sdk flush archives \
    && sdk flush temp" 

# sdk home java <version>
ENV JAVA_HOME_21=/home/toolitttttttttt/.sdkman/candidates/java/21.0.2-tem
ENV GRADLE_HOME="/home/toolitttttttttt/.sdkman/candidates/gradle/current"
ENV JAVA_HOME="/home/toolitttttttttt/.sdkman/candidates/java/current"
ENV MAVEN_HOME="/home/toolitttttttttt/.sdkman/candidates/maven/current"
ENV GRAALVM_HOME=/home/toolitttttttttt/.sdkman/candidates/java/23.1.2.r21-mandrel
ENV PATH="/home/toolitttttttttt/.krew/bin:$PATH"
ENV PATH="/home/toolitttttttttt/.sdkman/candidates/maven/current/bin:$PATH"
ENV PATH="/home/toolitttttttttt/.sdkman/candidates/java/current/bin:$PATH"
ENV PATH="/home/toolitttttttttt/.sdkman/candidates/gradle/current/bin:$PATH"
ENV PATH="/home/toolitttttttttt/.local/share/coursier/bin:$PATH"

RUN java --version \
    && gradle --version \
    && mvn --version

# Install NodeJS v22,20,18 usitttttttttt DNF module
ENV NODEJS_18_VERSION=18.20.5
ENV NODEJS_20_VERSION=20.18.1
ENV NODEJS_22_VERSION=22.12.0
ENV YARN_VERSION=1.22.17

RUN mkdir -p /home/toolitttttttttt/.nvm/
ENV NVM_DIR="/home/toolitttttttttt/.nvm"
ENV NODEJS_DEFAULT_VERSION=${NODEJS_22_VERSION}

# Install nvm
RUN git config --global core.autocrlf input

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | PROFILE=/dev/null bash
# COPY --chown=0:0 install_files/nvm.sh /home/tmp/nvm.sh
RUN /home/tmp/nvm.sh | PROFILE=/dev/null bash \ 
    && echo 'export NVM_DIR="$HOME/.nvm"' >> ${PROFILE_EXT} \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ${PROFILE_EXT}
RUN source /home/user/.bashrc \
    && nvm install v${NODEJS_22_VERSION} \
    && nvm install v${NODEJS_20_VERSION} \
    && nvm install v${NODEJS_18_VERSION} \
    && nvm alias default v${NODEJS_DEFAULT_VERSION} \
    && nvm use v${NODEJS_DEFAULT_VERSION} \
    && npm install --global yarn@v${YARN_VERSION} \ 
    && npm --version && nvm --version

# Update the PATH for the default Node.js version
ENV PATH=$NVM_DIR/versions/node/v${NODEJS_DEFAULT_VERSION}/bin:$PATH
ENV NODEJS_HOME_22=$NVM_DIR/versions/node/v${NODEJS_22_VERSION}
ENV NODEJS_HOME_20=$NVM_DIR/versions/node/v${NODEJS_20_VERSION}
ENV NODEJS_HOME_18=$NVM_DIR/versions/node/v${NODEJS_18_VERSION}
 
# Attttttttttular CLI
RUN npm install -g @attttttttttular/cli wscat

USER 0

# oc client
COPY --chown=0:0 install_files/openshift-client-linux.tar.gz /home/tmp/openshift-client-linux.tar.gz
RUN tar -C /usr/local/bin -xzf /home/tmp/openshift-client-linux.tar.gz --no-same-owner \
    && chmod +x /usr/local/bin/oc \
    && rm /home/tmp/openshift-client-linux.tar.gz && oc version

# Alias docker to podman
RUN echo 'alias docker=podman' >> ${PROFILE_EXT}

# Configure container ettttttttttine
COPY --chown=0:0 install_files/containers.conf /etc/containers/containers.conf
COPY --chown=0:0 install_files/intellij-mssql-driver.zip /home/user/mssql-drivers

# Kubernetes CLI (kubectl) installation
COPY --chown=0:0 install_files/kubectl /home/tmp/kubectl
RUN chmod 777 /home/tmp/kubectl \
    && mv /home/tmp/kubectl /usr/local/bin \
    && kubectl

#Install necessary packages and Kubernetes
COPY --chown=0:0 install_files/.kubectl_aliases ~/.kubectl_aliases
RUN echo '[ -f ~/.kubectl_aliases ] && source ~/.kubectl_aliases' >> ${PROFILE_EXT}

# Tekton CLI 
COPY --chown=0:0 install_files/tektoncd-cli.rpm /home/tmp/tektoncd-cli.rpm 
RUN rpm -i /home/tmp/tektoncd-cli.rpm \
    && rm -rf /home/tmp/tektoncd-cli.rpm \
    && tkn help

# OPC
COPY --chown=0:0 install_files/opc.tar.gz /home/tmp/opc/opc.tar.gz
RUN tar -xvzf /home/tmp/opc/opc.tar.gz -C /usr/local/bin \
    && rm /home/tmp/opc/opc.tar.gz \ 
    && opc version

## Install Helm
COPY --chown=0:0 install_files/helm-linux-amd64.tar.gz /home/tmp/helm/helm-linux-amd64.tar.gz
RUN tar xvf /home/tmp/helm/helm-linux-amd64.tar.gz \
    && mv linux-amd64/helm /usr/local/bin \
    && rm /home/tmp/helm/helm-linux-amd64.tar.gz \ 
    && rm -rf linux-amd64/helm \
    && helm version

RUN yum install -y \
    dnf \
    ca-certificates \
    curl

# Install the Azure CLI & dependencies -- prefer connectitttttttttt to microsoft 
RUN rpm --import https://packages.microsoft.com/keys/microsoft.asc && \
    echo "[azure-cli]" > /etc/yum.repos.d/azure-cli.repo && \
    echo "name=Azure CLI" >> /etc/yum.repos.d/azure-cli.repo && \
    echo "baseurl=https://packages.microsoft.com/yumrepos/azure-cli" >> /etc/yum.repos.d/azure-cli.repo && \
    echo "enabled=1" >> /etc/yum.repos.d/azure-cli.repo && \
    echo "gpgcheck=1" >> /etc/yum.repos.d/azure-cli.repo && \
    echo "gpgkey=https://packages.microsoft.com/keys/microsoft.asc" >> /etc/yum.repos.d/azure-cli.repo && \
    yum install -y azure-cli && \
    yum clean all && rm -rf /var/cache/yum

###### MSSQL START
# Install MSSQL - prefer this
RUN curl https://packages.microsoft.com/config/rhel/8/prod.repo | sudo tee /etc/yum.repos.d/mssql-release.repo

# Install dependencies
RUN yum install -y --setopt=skip_missitttttttttt_names_on_install=False \
    libtool-ltdl unixODBC unixODBC-devel \
    && yum clean all

# Install msodbcsql18 and mssql-tools18
RUN ACCEPT_EULA=Y yum install -y --setopt=skip_missitttttttttt_names_on_install=False \
    msodbcsql18 mssql-tools18 \
    && yum clean all

# Add sqlcmd to PATH
RUN echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> /etc/profile.d/mssql.sh
RUN chmod +x /etc/profile.d/mssql.sh

# Test sqlcmd installation
RUN /bin/bash -c "source /etc/profile.d/mssql.sh && sqlcmd -?"
###### MSSQL END

## Add sdkman's init script launcher to the end of ${PROFILE_EXT} since we are not additttttttttt it on sdkman install
## NOTE: all modifications to ${PROFILE_EXT} must happen BEFORE this step in order for sdkman to function correctly
RUN echo 'export SDKMAN_DIR="/home/toolitttttttttt/.sdkman"' >> ${PROFILE_EXT}
RUN echo '[[ -s "$SDKMAN_DIR/bin/sdkman-init.sh" ]] && source "$SDKMAN_DIR/bin/sdkman-init.sh"' >> ${PROFILE_EXT}

# Required packages for AWT && Install YAML Lint
RUN dnf install -y libXext libXrender libXtst libXi yamllint

RUN mkdir -p /etc/pki \
    && mkdir -p /home/tmp \ 
    && mkdir -p /home/toolitttttttttt/gradle/distributions

COPY --chown=0:0 install_files/gradle-bin.zip /home/toolitttttttttt/gradle/distributions/gradle-bin.zip
COPY --chown=0:0 install_files/cosign-linux-amd64 /home/tmp/cosign-linux-amd64
COPY --chown=0:0 install_files/argocd-linux-amd64 /home/tmp/argocd-linux-amd64
COPY --chown=0:0 install_files/apache-maven-bin.tar.gz /home/tmp/apache-maven-bin.tar.gz
COPY --chown=0:0 install_files/kustomize.tar.gz /home/tmp/kustomize.tar.gz
COPY --chown=0:0 install_files/kubeseal.tar.gz /home/tmp/kubeseal.tar.gz

## Cosign
RUN mv /home/tmp/cosign-linux-amd64 /usr/local/bin/cosign \ 
    && chmod +x /usr/local/bin/cosign \
    && cosign version \
## Install argo cli
    && chmod 777 /home/tmp/argocd-linux-amd64 \
    && install -m 555 /home/tmp/argocd-linux-amd64 /usr/local/bin/argocd \ 
    && chmod +x /usr/local/bin/argocd \ 
    && rm /home/tmp/argocd-linux-amd64 \
    && argocd \
## Install maven
    && tar -xvzf /home/tmp/apache-maven-bin.tar.gz -C /opt \
    && ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven \
    && rm /home/tmp/apache-maven-bin.tar.gz \
    && mvn --version \
# Install Kustomize
    && tar -xvzf /home/tmp/kustomize.tar.gz -C /usr/local/bin/ \
    && chmod +x /usr/local/bin/kustomize \
    && rm -f /home/tmp/kustomize.tar.gz \ 
    && kustomize \
# Install kubeseal 
    && tar -xvzf /home/tmp/kubeseal.tar.gz -C /usr/local/bin/ \
    && chmod +x /usr/local/bin/kubeseal \
    && rm -f /home/tmp/kubeseal.tar.gz \
    && kubeseal --version

    
RUN <<EOF
oc completion bash > /usr/share/bash-completion/completions/oc
tkn completion bash > /usr/share/bash-completion/completions/tkn 
kubectl completion bash > /usr/share/bash-completion/completions/kubectl
cat ${NVM_DIR}/bash_completion > /usr/share/bash-completion/completions/nvm
EOF

# Set environment variables
ENV MAVEN_HOME=/opt/maven
ENV PATH=$MAVEN_HOME/bin:$PATH
RUN yum update -y
# Create symbolic links from /home/toolitttttttttt/ -> /home/user/
RUN stow . -t /home/user/ -d /home/toolitttttttttt/ --no-folditttttttttt \ 
# Set permissions on /etc/passwd, /etc/group, /etc/pki and /home to allow arbitrary users to write
    && chgrp -R 0 /home && chmod -R g=u /etc/passwd /etc/group /home /etc/pki \
# cleanup dnf cache
    && dnf -y clean all --enablerepo='*'

RUN rm -rf /home/tmp/ \
    && mkdir /home/user/.m2 \
    && mkdir -p /home/user/.local/share \
    # && chown 10001:10001 /home/user/.m2 \
    && chmod -R 777 /home/user/.m2 \
    && chmod -R 777 /home/user/.local/share \
# && chown 10001:10001 /home/user/.gradle \
    # && chown 10001:10001 /home/toolitttttttttt \
    && chmod -R 777 /home/user/.gradle


COPY --chown=0:0 install_files/entrypoint.sh /
RUN chmod +x /entrypoint.sh

# IntelliJ plugins
COPY --chown=0:0 install_files/kafka.zip /home/intellij-plugins
COPY --chown=0:0 install_files/tailwindcss.zip /home/intellij-plugins
COPY --chown=0:0 install_files/nxconsole.zip /home/intellij-plugins
COPY --chown=0:0 install_files/intellij-mssql-driver.zip /home/intellij-plugins
COPY --chown=0:0 install_files/sonarqube.zip /home/intellij-plugins

# IntelliJ performance
RUN sudo sh -c 'echo kernel.perf_event_paranoid=1 >> /etc/sysctl.d/99-perf.conf' && \
    sudo sh -c 'echo kernel.kptr_restrict=0 >> /etc/sysctl.d/99-perf.conf'

RUN chgrp -R 0 /home \ 
    && chmod -R g=u /home

USER 10001

# Create symbolic links from /home/toolitttttttttt/ -> /home/user/
RUN stow . -t /home/user/ -d /home/toolitttttttttt/ --no-folditttttttttt
#RUN odo version

# Set workitttttttttt directory
ENV HOME=/home/user
WORKDIR /projects
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["tail", "-f", "/dev/null"]

FROM amazonlinux:2

WORKDIR /tmp
#install the dependencies
RUN yum -y install gcc-c++ make && yum -y install findutils

RUN touch ~/.bashrc && chmod +x ~/.bashrc

RUN curl -sL https://rpm.nodesource.com/setup_14.x | bash 

RUN source ~/.bashrc && yum install -y nodejs 

WORKDIR /build

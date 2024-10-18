# real-time-data-architecture-kafka-flink-dw-k8s

![POC Architecture](.ignore/image.png)

# Elements
- [x] Redis
  - [x] Eviction Policy LRU
  - [x] Max memory defined (100MB)
- [x] Node backend api
  - [x] Swagger documentation at /api-docs
  - [x] endpoints:
    - [x] [POST] /mock/user
    - [x] [GET]  /mock/user/:userid
    - [x] [GET]  /metrics (for prometheus)
  - [X] Save user data on the "mock-user-topic"
- [x] Kafka + Zookeeper
- [x] CMAK
- [ ] Api Gateway
- [x] Monitoring & Logging
  - [x] Grafana
  - [x] Prometheus
- [x] Flink
  - [x] Read message from kafka
  - [x] Process it and save it on the DW
- [x] DW
  - [x] Configuration
  - [x] Creation of the DW tables
- [x] PowerBI
  - [x] Oracle Support Plugin (64-bit Oracle Client for Microsoft Tools 19c)
    - [x] https://www.oracle.com/database/technologies/appdev/ocmt.html
- [ ] Kubernetes
  - [ ] Minikube (https://minikube.sigs.k8s.io/)


# Starting Minikube

```
  minikube start --driver=docker
  minikube dashboard
```

# Publishing everything to the minikube for the first time
```
  kubectl apply -f .\zookeper-deployment.yaml
  kubectl apply -f .\kafka-deployment.yaml
  kubectl apply -f .\redis-deployment.yaml

  # build the node-backend-api image
  docker build -t node-backend-api:latest ./node-backend-api

  # load it to minikube
  minikube image load node-backend-api:latest

  # apply the deployment for the node backend api
  kubectl apply -f .\node-backend-api-deployment.yaml

  kubectl apply -f .\prometheus-deployment.yaml
  kubectl apply -f .\grafana-deployment.yaml
  kubectl apply -f .\oracle-db-deployment.yaml

  # build the flink-consumer image
  docker build -t flink-consumer:latest ./flink-consumer
  minikube image load flink-consumer:latest
  kubectl apply -f .\flink-consumer-deployment.yaml
```

# Minikube useful comands
```
  # list pods
  kubectl get pods
  # fowarding one local port to one pod:
  kubectl port-forward <pod-name> 3001:3001
```

# Connecting in PowerBI
User: jorgermduarte
pass: 123456
server: localhost:1521/jorgermduarte
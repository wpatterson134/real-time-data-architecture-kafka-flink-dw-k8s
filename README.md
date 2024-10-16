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



# Connecting in PowerBI
User: your_user
pass: 123456
server: localhost:1521/xe
# real-time-data-architecture-kafka-flink-dw-k8s



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
  - [ ] Creation of the DW tables
- [ ] PowerBI
- [ ] Kubernetes

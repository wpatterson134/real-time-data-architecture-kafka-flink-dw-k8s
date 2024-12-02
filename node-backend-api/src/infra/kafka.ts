import kafka, { Producer, KafkaClient, CreateTopicRequest } from 'kafka-node';

const kafkaHost = process.env.KAFKA_BROKER || 'localhost:9092';
const kafkaClient = new kafka.KafkaClient({ kafkaHost, requestTimeout: 100000 });
const producer: Producer = new kafka.Producer(kafkaClient);

// Função para criar tópicos
const createTopics = () => {
  const topics: CreateTopicRequest[] = [
    { topic: 'course-topic', partitions: 1, replicationFactor: 1 },
    { topic: 'enrollments-topic', partitions: 1, replicationFactor: 1 },
    { topic: 'benchmark-topic', partitions: 1, replicationFactor: 1 },
    { topic: 'performance-topic', partitions: 1, replicationFactor: 1 },
  ];

  return new Promise<void>((resolve, reject) => {
    kafkaClient.createTopics(topics, (err, result) => {
      if (err) {
        console.error('Erro ao criar/verificar tópicos:', err);
        return reject(err);
      }
      console.log('Tópicos criados ou verificados:', result);
      resolve();
    });
  });
};

// Evento de 'ready' do producer
producer.on('ready', async () => {
  console.log('Kafka Producer está pronto.');

  try {
    await createTopics();
  } catch (error) {
    console.error('Erro ao inicializar tópicos:', error);
  }
});

// Evento de 'error' do producer
producer.on('error', (err: Error) => {
  console.error('Erro no Kafka Producer:', err);
});

// Objeto KafkaProducer
const KafkaProducer = {
  getProducer: () => producer,

  sendMessages: (topic: string, message: any): Promise<any> => {
    // @ts-ignore
    if (!producer.ready) {
      console.error('Producer ainda não está pronto.');
      return Promise.reject(new Error('Kafka Producer não está pronto.'));
    }

    return new Promise((resolve, reject) => {
      producer.send(
        [{ topic, messages: JSON.stringify(message) }],
        (err, data) => {
          if (err) {
            console.error('Erro ao enviar mensagem:', err);
            return reject(err);
          }
          console.log('Mensagem enviada com sucesso:', data);
          resolve(data);
        }
      );
    });
  },
};

export default KafkaProducer;

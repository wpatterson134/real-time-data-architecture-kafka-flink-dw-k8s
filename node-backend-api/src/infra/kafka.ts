import kafka, { Producer } from 'kafka-node';

const kafkaClient = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER || 'localhost:9092', requestTimeout: 100000 });
const producer: Producer = new kafka.Producer(kafkaClient);

producer.on('ready', async () => {
  console.log('Kafka Producer connected successfully.');
});

producer.on('error', (err: Error) => {
  console.error('Erro no produtor Kafka:', err);
});

const KafkaProducer = {
  getProducer: () => producer,
  sendMessages: (topic: string, message: any) => {
    return new Promise((resolve: any, reject: any) => {
      producer.send([
        { topic, messages: JSON.stringify(message) },
      ], (err: any, data: any) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
}

export default KafkaProducer;
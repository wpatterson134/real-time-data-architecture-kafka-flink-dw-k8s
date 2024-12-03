import { Kafka } from 'kafkajs';
import { CourseMessage } from './types';
import { CourseProcessor } from './processors/courseProcessor';

const kafka = new Kafka({
  clientId: 'course-consumer',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'course-consumer-group-02' });
const topics_to_subscribe = ['course-topic'];

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: topics_to_subscribe, fromBeginning: true });
  console.log("Subscribed to topics: ", topics_to_subscribe);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = message.value?.toString();
      if (messageValue) {
        try {
          const courseMessage: CourseMessage = JSON.parse(messageValue);

          // handle the different topic types
          if(topic === 'course-topic'){
            console.log('> Processing course message:');
            await CourseProcessor.process(courseMessage);
          }

        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    },
  });
};


run().catch(console.error);

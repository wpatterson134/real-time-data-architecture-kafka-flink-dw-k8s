import { Kafka } from 'kafkajs';
import { CourseMessage, EnrollmentMessage } from './types';
import { CourseProcessor } from './processors/courseProcessor';
import { EnrollmentProcessor } from './processors/enrollmentProcessor';

const kafka = new Kafka({
  clientId: 'course-consumer',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'course-consumer-group-16' });
const topics_to_subscribe = ['enrollments-topic'];
// const topics_to_subscribe = ['course-topic'];

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: topics_to_subscribe, fromBeginning: true });
  console.log("Subscribed to topics: ", topics_to_subscribe);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = message.value?.toString();
      if (messageValue) {
        try {

          // handle the different topic types
          if(topic === 'course-topic'){
            console.log('> Processing course message:');
            const courseMessage: CourseMessage = JSON.parse(messageValue);
            await CourseProcessor.process(courseMessage);
          } else if(topic === 'enrollments-topic'){
            console.log('> Processing enrollment message:');
            const enrollmentMessage: EnrollmentMessage[] = JSON.parse(messageValue);
            await EnrollmentProcessor.process(enrollmentMessage);
          }

        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    },
  });
};


run().catch(console.error);

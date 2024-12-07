import { Kafka } from 'kafkajs';
import * as dotenv from 'dotenv';
dotenv.config();

import { BenchmarkMessage, CourseMessage, EnrollmentMessage, PerformanceMessage } from './types';
import { CourseProcessor } from './processors/courseProcessor';
import { EnrollmentProcessor } from './processors/enrollmentProcessor';
import { PerformanceProcessor } from './processors/performanceProcessor';
import { BenchmarkProcessor } from './processors/benchmarkProcessor';

const kafka = new Kafka({
  clientId: 'course-consumer',
  brokers: [
    `${process.env.KAFKA_BROKER}`,
  ],
});

const consumer = kafka.consumer({ groupId: 'course-consumer-group-16' });
const topics_to_subscribe = ['enrollments-topic', 'performance-topic','course-topic', 'benchmark-topic'];

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
            // console.log('> Processing course message:');
            const courseMessage: CourseMessage = JSON.parse(messageValue);
            await CourseProcessor.process(courseMessage);
          } else if(topic === 'enrollments-topic'){
            // console.log('> Processing enrollment message:');
            const enrollmentMessage: EnrollmentMessage[] = JSON.parse(messageValue);
            await EnrollmentProcessor.process(enrollmentMessage);
          }else if (topic === 'performance-topic'){
            // console.log('> Processing performance message:');
            const performanceMessage: PerformanceMessage = JSON.parse(messageValue);
            await PerformanceProcessor.process(performanceMessage);
          } else if (topic === 'benchmark-topic'){
            // console.log('> Processing benchmark message:');
            const benchmarkMessage: BenchmarkMessage = JSON.parse(messageValue);
            await BenchmarkProcessor.process(benchmarkMessage);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    },
  });
};


run().catch(console.error);

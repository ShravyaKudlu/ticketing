import { Listener, OrderCreatedEvent, Subjects } from "@skgtick/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("waiting this many milliseconds to process the job:", delay);

    try {
      await expirationQueue.add(
        {
          orderId: data.id,
        },
        {
          delay: delay,
        }
      );

      msg.ack();
    } catch (error) {
      console.error("Error adding job to expiration queue:", error);
    }
  }
}
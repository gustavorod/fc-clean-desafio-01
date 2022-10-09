import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        where: {
          id: entity.id,
        },
      },
    );
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        include: ["items"],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const orderItems: OrderItem[] = orderModel.items.map((orderItem) => {
      return new OrderItem(orderItem.id, orderItem.name, (orderItem.price / orderItem.quantity), orderItem.product_id, orderItem.quantity);
    });

    const order = new Order(orderModel.id, orderModel.customer_id, orderItems);

    return order;
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({include: ["items"]});

    const orders = orderModels.map((orderModel) => {
      const orderItems: OrderItem[] = orderModel.items.map((orderItem) => {
        return new OrderItem(orderItem.id, orderItem.name, (orderItem.price / orderItem.quantity), orderItem.product_id, orderItem.quantity);
      });

      let order = new Order(orderModel.id, orderModel.customer_id, orderItems);

      return order;
    });

    return orders;

  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
}

import { useAsyncData } from "./useAsyncData";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const fetchNotifications = async (): Promise<Notification[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [
    {
      id: "1",
      title: "Contribution received",
      message: "Sarah K. contributed 100 USDC to Home Fund.",
      read: false,
      createdAt: "2023-10-21T2:30:00Z",
    },
    {
      id: "2",
      title: "Payment sent",
      message: "You sent 55.2 USDC to Sarah P.",
      read: true,
      createdAt: "2023-10-18T23:45:00Z",
    },
  ];
};

export const useNotifications = () =>
  useAsyncData<Notification[]>(fetchNotifications, {
    errorMessage: "Failed to fetch notifications data",
  });

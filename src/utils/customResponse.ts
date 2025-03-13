export const customResponse = ({
  message,
  statusCode,
  data,
}: {
  message: string | null;
  statusCode: number;
  data?: any;
}) => {
  const isSuccess = statusCode >= 200 && statusCode < 300;
  return {
    ...(isSuccess ? { message } : { error: message }),
    statusCode,
    success: isSuccess,
    status: isSuccess ? "success" : "failed",
    data,
  };
};

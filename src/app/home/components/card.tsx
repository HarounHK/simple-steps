type CardProps = {
  title: string;
  value: string | number;
};

export default function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white text-black p-4 rounded-xl shadow-md flex flex-col items-center justify-center">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
import { useParams } from 'react-router-dom';

export function Workout() {
  const { dayNumber } = useParams<{ dayNumber: string }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-display font-bold">Workout</h1>
      <p className="text-witch-600 mt-2">Day {dayNumber}</p>
    </div>
  );
}

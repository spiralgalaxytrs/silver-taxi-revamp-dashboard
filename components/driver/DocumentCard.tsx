// components/drivers/DocumentCard.tsx
interface DocumentCardProps {
  type: string;
  name: string;
  url: string;
  verified: boolean;
  onVerify: () => void;
  onReject: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  type,
  name,
  url,
  verified,
  onVerify,
  onReject
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-2">
        <h4 className="font-medium text-center">{name}</h4>
      </div>
      <div className="p-2">
        <img 
          src={url} 
          alt={type} 
          className="w-full h-48 object-contain border mb-2"
        />
        <div className="flex justify-between space-x-2">
          <button
            onClick={onVerify}
            className={`flex-1 py-1 px-2 text-sm rounded ${verified ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {verified ? 'Verified' : 'Verify'}
          </button>
          <button
            onClick={onReject}
            className={`flex-1 py-1 px-2 text-sm rounded ${!verified && verified !== undefined ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
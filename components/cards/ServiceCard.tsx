import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Trash } from 'lucide-react';
import { Switch } from '../ui/switch';
import { useRouter } from 'next/navigation';
interface ServiceCardProps {
    serviceId: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ serviceId }) => {

    const router = useRouter()

    const [isActive, setIsActive] = useState(true)

    const handleSwitchChange = () => {
        setIsActive(!isActive)
    }

    return (
        <Card className="w-full max-w-sm bg-white shadow-md rounded-lg">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex justify-end">
                    <Switch
                        checked={isActive}
                        onCheckedChange={handleSwitchChange}
                    />
                </CardTitle>
            </CardHeader>
            <CardContent>
                    <h1 className='text-4xl text-center'>
                        {serviceId}
                    </h1>
            </CardContent>

            <div className="flex justify-between p-4">
                <Button variant="primary" onClick={() => router.push(`/admin/tariff/edit/${serviceId}`)}>Edit</Button>
                <Button variant="none"
                    className='bg-red-500 hover:bg-red-600'
                >
                    <Trash className='w-4 h-4 text-white' />
                </Button>
            </div>
        </Card>
    );
};


export default ServiceCard;


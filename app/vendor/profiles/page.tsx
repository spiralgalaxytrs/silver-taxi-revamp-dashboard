"use client"

import React, { useEffect } from "react"
import { BsWhatsapp } from "react-icons/bs";
import { motion } from "framer-motion"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Tabs, TabsContent } from "components/ui/tabs"
import { useProfileStore } from "stores/-profileStore"

// Update the store hook with types

function TaxiCompanyProfile() {
  const { profile, fetchVendorProfile, deleteProfile, isLoading } = useProfileStore()

  useEffect(() => {
    fetchVendorProfile()
  }, [fetchVendorProfile])

  const handleDelete = (companyId: string | undefined) => {
    if (companyId) {
      deleteProfile(companyId)
    }
  }

  if (isLoading) {
    <>
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    </>
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#EBF3E8] to-[#EBF3E8] py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-[#009F7F] to-[#009F7F]">
              <h2 className="flex justify-center items-center pt-16 text-white text-4xl font-bold">Company Details</h2>
            </div>
            <CardHeader className="-mt-20 flex flex-col items-center space-y-4 pb-6 relative">
              <div className="bg-white rounded-md">
                <div className="w-[300px] h-[150px] p-3">
                  <img src={profile?.logo ? profile?.logo as string : "/img/no_img.webp"} className="w-[400px] h-[125px]" alt={profile?.name || "Default Name"} />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {profile?.name || "Taxi Company Name"}
                </CardTitle>
                {/* <p className="text-xl text-gray-600">{profile?.email || "company@example.com"}</p> */}
              </div>
              {/* {profile ? (
                <Link href={`/vendor/profiles/edit/${profile.companyId}`} className="absolute top-4 right-4">
                  <Button variant="secondary" size="sm" className="rounded-full">
                    <UserRoundIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <Link href="/vendor/profiles/create" className="absolute top-4 right-4">
                  <Button variant="secondary" size="sm" className="rounded-full">
                    Create Profile
                  </Button>
                </Link>
              )} */}
              {/* {profile && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-4 left-4 rounded-full"
                  onClick={() => handleDelete(profile?.companyId)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )} */}
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="details">
                <TabsContent value="details">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <InfoItem icon={<Phone className="text-[#009F7F]" />} content={profile?.phone?.join(", ")} />
                        <InfoItem icon={<Mail className="text-[#009F7F] " />} content={profile?.email} />
                        <InfoItem
                          icon={<Globe className="text-[#009F7F]" />}
                          content={
                            <a
                              href={profile?.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#009F7F] hover:underline"
                            >
                              {profile?.website}
                            </a>
                          }
                        />
                        <InfoItem icon={<BsWhatsapp className="text-[#009F7F] h-6 w-6" />} content={profile?.whatsappNumber?.join(", ")} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <InfoItem label="GST Number" content={profile?.GSTNumber || "Not Available"} />
                        <InfoItem label="UPI ID" content={profile?.UPI?.id || "Not Available"} />
                        <InfoItem label="UPI Number" content={profile?.UPI?.number || "Not Available"} />
                        {/* <InfoItem label="Driver Minimum Wallet Amount" content={profile?.driverWalletAmount} />
                        <InfoItem label="Vendor Minimum Wallet Amount" content={profile?.vendorWalletAmount} /> */}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Address</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start space-x-3 text-gray-700">
                          <MapPin className="w-5 h-5 text-[#009F7F] mt-1" />
                          <span>
                            {profile?.address && profile?.address.split("\n").map((line, index) => (
                              <React.Fragment key={index}>
                                {line}
                                <br />
                              </React.Fragment>
                            ))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Social Media Links</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <InfoItem label="Facebook" content={
                          <a href={profile?.socialLinks?.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {profile?.socialLinks?.facebook || "Not Available"}
                          </a>
                        } />
                        <InfoItem label="Instagram" content={
                          <a href={profile?.socialLinks?.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {profile?.socialLinks?.instagram || "Not Available"}
                          </a>
                        } />
                        <InfoItem label="Youtube" content={
                          <a href={profile?.socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {profile?.socialLinks?.youtube || "Not Available"}
                          </a>
                        } />
                        <InfoItem label="x" content={
                          <a href={profile?.socialLinks?.x} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {profile?.socialLinks?.x || "Not Available"}
                          </a>
                        } />
                      </CardContent>
                    </Card>  */}

                  </div>

                  {/* <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{profile?.description || "No description available."}</p>
                  </CardContent>
                </Card> */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}

// Add types to InfoItem props
interface InfoItemProps {
  icon?: React.ReactNode;
  label?: string;
  content?: string | React.ReactNode;
}

function InfoItem({ icon, label, content }: InfoItemProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-700">
        {icon && <span className="text-yellow-500">{icon}</span>}
        {label && <span className="font-medium">{label}:</span>}
        <span>{content}</span>
      </div>
    </>
  )
}

export default TaxiCompanyProfile


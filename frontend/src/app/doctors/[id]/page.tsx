import DoctorProfileClient from "./DoctorProfileClient";

export async function generateStaticParams() {
  return [
    { id: "doc_1" },
    { id: "doc_2" },
    { id: "doc_3" },
    { id: "doc_4" },
  ];
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorProfileClient id={id} />;
}

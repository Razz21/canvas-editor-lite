import PageClient from './page.client';

export type PageProps = {
  params: Promise<{}>;
  searchParams: Promise<{}>;
};

export default function Page({}: PageProps) {
  return (
    <div>
      <PageClient />
    </div>
  );
}

type AuthPageHeaderProps = {
  title: string;
  description: string;
};

export default function AuthPageHeader({
  title,
  description,
}: AuthPageHeaderProps) {
  return (
    <div>
      <h1 className="auth-page-title">{title}</h1>
      <p className="auth-page-description">{description}</p>
    </div>
  );
}

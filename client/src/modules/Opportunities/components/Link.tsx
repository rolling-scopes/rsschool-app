type Props = {
  url: string;
  title?: string;
  text?: string;
};

export function Link({ url, text, title }: Props) {
  return url ? (
    <a title={title} className="rs-link" target="_blank" rel="nofollow" href={url}>
      {text}
    </a>
  ) : (
    <>{text}</>
  );
}

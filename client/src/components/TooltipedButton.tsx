import { Button, Tooltip } from "antd";

export type TooltipedButtonProps = {
  tooltipTitle: string;
  buttonText: string;
  open: boolean;
  loading: boolean;
  disabled: boolean;
}

export function TooltipedButton(props: TooltipedButtonProps) {
  const { tooltipTitle, open, loading, disabled, buttonText } = props;

  return (
    <Tooltip title={tooltipTitle} open={open}>
      <Button loading={loading} type="primary" htmlType="submit" disabled={disabled}>
        {buttonText}
      </Button>
    </Tooltip>
  )
}
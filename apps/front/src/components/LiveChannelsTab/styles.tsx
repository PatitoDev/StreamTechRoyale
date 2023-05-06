import { createStyles } from "@mantine/core";

export const useStyles = createStyles((theme) => ({
  TwitchContainer: {
    height: '40em',
    [theme.fn.largerThan('sm')]: {
        height: '100%',
    },
  }
}));
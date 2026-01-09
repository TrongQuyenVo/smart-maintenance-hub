import { ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useTheme } from './ThemeContext';

interface Props {
  children: ReactNode;
}

export default function AntdThemeProvider({ children }: Props) {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,

        token: {
          /* Modal / Popover */
          colorBgElevated: 'hsl(var(--background))',

          /* Text & Border sync (optional nhưng nên có) */
          colorText: 'hsl(var(--foreground))',
          colorBorder: 'hsl(var(--border))',
          colorPrimary: 'hsl(var(--primary))',
        },

        components: {
          Input: {
            colorBgContainer: 'hsl(var(--input))',
          },
          Select: {
            colorBgContainer: 'hsl(var(--input))',
          },
          DatePicker: {
            colorBgContainer: 'hsl(var(--input))',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

/**
 * @file `Devdex.tsx`
 * @author Keith Choison <keith@tize.io>
 * @since 1.2.5
 */

import * as React from 'react';
import cx from 'classnames';
import { BuildInfo } from '@showdex/components/debug';
import { TextField } from '@showdex/components/form';
import { PageContainer } from '@showdex/components/layout';
import { ToggleButton } from '@showdex/components/ui';
import { type LoggerLevel, LoggerLevelValues, teledex } from '@showdex/utils/debug';
import styles from './Devdex.module.scss';

export interface DevdexProps {
  onLeaveRoom?: () => void;
}

const l = { scope: '@showdex/pages/Devdex' };

export const Devdex = ({
  onLeaveRoom,
}: DevdexProps): React.JSX.Element => {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  const [minLevel] = React.useState<LoggerLevel>('debug');
  const [scope, setScope] = React.useState('');
  const [text, setText] = React.useState('');

  React.useEffect(() => teledex.subscribe(() => force()), []);

  const rows = teledex.filter({ level: LoggerLevelValues[minLevel], scope, text }).slice(-500);

  return (
    <PageContainer
      name="devdex"
      className={styles.container}
      prefix={<BuildInfo className={styles.buildInfo} position="top-right" />}
      contentScrollable
    >
      <div className={styles.toolbar}>
        <TextField
          hint="scope…"
          meta={{}}
          input={{
            name: `${l.scope}:Scope`,
            value: scope,
            onChange: (value: string) => setScope(value),
            onBlur: () => void 0,
            onFocus: () => void 0,
          }}
        />

        <TextField
          hint="text…"
          meta={{}}
          input={{
            name: `${l.scope}:Text`,
            value: text,
            onChange: (value: string) => setText(value),
            onBlur: () => void 0,
            onFocus: () => void 0,
          }}
        />

        <ToggleButton
          label="Flush"
          absoluteHover
          onPress={() => void teledex.flush({ to: 'file' })}
        />

        <ToggleButton
          label="Copy"
          absoluteHover
          onPress={() => void teledex.flush({ to: 'clipboard' })}
        />

        <ToggleButton
          label="Clear"
          absoluteHover
          onPress={() => void teledex.clear()}
        />

        <ToggleButton
          absoluteHover
          onPress={onLeaveRoom}
        >
          <i className="fa fa-close" />
          <span>Close</span>
        </ToggleButton>
      </div>

      <div className={styles.log}>
        {rows.map((r) => (
          <div key={r.id} className={cx(styles.row, styles[r.level])}>
            <span className={styles.ts}>{new Date(r.ts).toLocaleTimeString()}</span>
            <span className={styles.level}>{r.level}</span>
            <span className={styles.scope}>{r.scope}</span>
            <span className={styles.msg}>
              {r.args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

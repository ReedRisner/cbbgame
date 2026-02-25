import AttributeBar from './AttributeBar';

export default function SchemeSliders({ coach }: { coach: any }) {
  const keys = [
    ['pace', 'Pace'], ['spacing', 'Spacing'], ['pressureDefense', 'Pressure D'], ['crashBoards', 'Crash Boards'],
    ['transitionFocus', 'Transition'], ['pickAndRollUsage', 'PnR'], ['zoneRate', 'Zone Rate'], ['benchDepthTrust', 'Bench Trust']
  ] as const;
  return <div className="grid grid-cols-2 gap-2">{keys.map(([k, label]) => <AttributeBar key={k} label={label} value={coach[k]} />)}</div>;
}

import TabNav from '../layout/TabNav'
import { workspaceTabs, type WorkspaceTabId } from './workspace'

type WorkspaceTabsProps = { value: WorkspaceTabId; onChange: (tab: WorkspaceTabId) => void }

export default function WorkspaceTabs({ value, onChange }: WorkspaceTabsProps) {
  return (
    <TabNav
      items={workspaceTabs}
      value={value}
      onChange={onChange}
      navLabel="Journey workspace"
      tabsLabel="Journey sections"
      idPrefix="workspace-tab"
      panelId="workspace-panel"
    />
  )
}

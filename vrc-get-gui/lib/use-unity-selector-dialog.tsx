import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {Radio} from "@material-tailwind/react";
import {nop} from "@/lib/nop";
import {tc} from "@/lib/i18n";

type UnityInstallation = [path: string, version: string, fromHub: boolean];

type StateUnitySelector = {
	state: "normal";
} | {
	state: "selecting";
	unityVersions: UnityInstallation[];
	resolve: (unityPath: string | null) => void;
}

type ResultUnitySelector = {
	dialog: React.ReactNode;
	select: (unityList: [path: string, version: string, fromHub: boolean][]) => Promise<string | null>;
}

export function useUnitySelectorDialog(): ResultUnitySelector {
	const [installStatus, setInstallStatus] = React.useState<StateUnitySelector>({state: "normal"});

	const select = (unityVersions: UnityInstallation[]) => {
		return new Promise<string | null>((resolve) => {
			setInstallStatus({state: "selecting", unityVersions, resolve});
		});
	}
	let dialog: React.ReactNode = null;

	switch (installStatus.state) {
		case "normal":
			break;
		case "selecting":
			const resolveWrapper = (unityPath: string | null) => {
				setInstallStatus({state: "normal"});
				installStatus.resolve(unityPath);
			};
			dialog = <Dialog open>
        <DialogContent className={"whitespace-normal"}>
          <DialogTitle>{tc("projects:manage:dialog:select unity header")}</DialogTitle>
          <SelectUnityVersionDialog
            unityVersions={installStatus.unityVersions}
            cancel={() => resolveWrapper(null)}
            onSelect={(unityPath) => resolveWrapper(unityPath)}
          />
        </DialogContent>
			</Dialog>;
			break;
		default:
			const _: never = installStatus;
	}

	return {dialog, select};
}

function SelectUnityVersionDialog(
	{
		unityVersions,
		cancel,
		onSelect,
	}: {
		unityVersions: UnityInstallation[],
		cancel: () => void,
		onSelect: (unityPath: string) => void,
	}) {
	const name = useState(() => `select-unity-version-${Math.random().toString(36).slice(2)}-radio`)[0];

	const [selectedUnityPath, setSelectedUnityPath] = useState<string | null>(null);

	return (
		<>
			<div>
				<p>
					{tc("projects:manage:dialog:multiple unity found")}
				</p>
				{unityVersions.map(([path, version, _]) =>
					<Radio
						key={path} name={name} label={`${version} (${path})`}
						checked={selectedUnityPath == path}
						onChange={() => setSelectedUnityPath(path)}
					/>)}
			</div>
			<div className={"wl-auto"}>
				<Button onClick={cancel} className="mr-1">{tc("general:button:cancel")}</Button>
				<Button
					onClick={() => onSelect(selectedUnityPath!)}
					disabled={selectedUnityPath == null}
				>{tc("projects:manage:button:continue")}</Button>
			</div>
		</>
	);
}

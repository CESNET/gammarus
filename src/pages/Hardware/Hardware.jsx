import { useContext } from 'react';
import Page from '@/layout/Page/Page';
import { YangDataContext } from '@/contexts/YangDataContext';
import HardwareTree from '@/components/Hardware/HardwareTree';

export default function Hardware() {
	const { model } = useContext(YangDataContext);
	const hardware = model['ietf-hardware:hardware'];

	if (!model) return null;

	const prepareData = (component) => {
		const map = {};

		//Prepare component data
		component.forEach((comp) => (map[comp.name] = { ...comp, children: [] }));

		// Populate the children array based on the parent attribute
		const rootComponents = [];
		component.forEach((comp) => {
			if (comp.parent) {
				map[comp.parent].children.push(map[comp.name]);
			} else {
				rootComponents.push(map[comp.name]);
			}
		});

		return rootComponents;
	};

	if (hardware) {
		return (
			<Page title="Hardware">
				<div className="container">{HardwareTree(prepareData(hardware.component))}</div>
			</Page>
		);
	}
	return <Page title="Hardware"></Page>;
}

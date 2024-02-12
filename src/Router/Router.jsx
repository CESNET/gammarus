import { Routes, Route } from 'react-router-dom';

import Dashboard from '@/pages/Dashboard/Dashboard';
import Error404 from '@/pages/Error/404';
import ChannelPlan from '@/pages/Channels/Channel-plan';
import Hardware from '@/pages/Hardware/Hardware';

export default function Router() {
	return (
		<Routes>
			<Route path="/channel-plan" element={<ChannelPlan />}></Route>
			<Route path="/hardware" element={<Hardware />}></Route>
			<Route path="/" element={<Dashboard />}></Route>
			<Route path="*" element={<Error404 />}></Route>
		</Routes>
	);
}

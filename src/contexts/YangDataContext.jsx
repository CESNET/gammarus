import { createContext, useState } from 'react';
import { useFetchYangData } from '@/hooks/useFetchYangData';
import PropTypes from 'prop-types';

const datasources = [{ type: 'static', url: 'line-id210516.json', name: 'line-id210516.json' }];
const UPDATE_INTERVAL_MS = 5000;

export const YangDataContext = createContext();

// Context provider for the YANG data
const YangDataProvider = ({ children }) => {
	const [selectedSource, setSelectedSource] = useState(datasources[0]);
	const { loading, yangData } = useFetchYangData(selectedSource, UPDATE_INTERVAL_MS);
	const model = { ...yangData };

	return <YangDataContext.Provider value={{ model, loading }}>{children}</YangDataContext.Provider>;
};

export default YangDataProvider;

YangDataProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

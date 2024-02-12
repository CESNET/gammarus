import { styled } from '@mui/material/styles';
import ComponentTable from '@/components/Hardware/ComponentTable';

export default function HardwareTree(component) {
	return (
		<TreeContainer>
			{component.map((node) => {
				const children = [...node.children.filter((item) => item.class !== 'iana-hardware:sensor')];
				return (
					<li key={node.name}>
						<ComponentTable component={node} sensors={node.children.filter((item) => item.class === 'iana-hardware:sensor')} />
						{children && children.length > 0 && HardwareTree(children)}
					</li>
				);
			})}
		</TreeContainer>
	);
}

const TreeContainer = styled('ul')(({ theme }) => ({
	'&:first-child > li': {
		'&:before': {
			display: 'none',
		},
	},
	'& li:not(.MuiListItem-root)': {
		listStyleType: 'none',
		margin: theme.spacing(1, 0, 1, 0),
		position: 'relative',
		'&:before': {
			content: '""',
			position: 'absolute',
			top: '-9px',
			left: `-${theme.spacing(2.5)}`,
			borderLeft: '1px solid #ddd',
			borderBottom: '1px solid #ddd',
			width: theme.spacing(2.5),
			height: '15px',
		},
		'&:after': {
			content: '""',
			position: 'absolute',
			top: '5px',
			left: `-${theme.spacing(2.5)}`,
			borderLeft: '1px solid #ddd',
			borderTop: '1px solid #ddd',
			width: theme.spacing(2.5),
			height: '100%',
		},
		'&:last-child:after': {
			display: 'none',
		},
	},
}));

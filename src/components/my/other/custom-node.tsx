import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import styles from './s.module.scss';
import { Button, Menu, MenuDivider, MenuItem, Popover, Spinner } from '@blueprintjs/core';

interface CustomNodeData {
	label: string;
	roll: number;
}

const _CustomNode = ({ data }: NodeProps<CustomNodeData>) => {

	const exampleMenu = (
		<Menu>
			<MenuItem icon="graph" text="Graph" />
			<MenuItem icon="map" text="Map" />
			<MenuItem icon="th" text="Table" shouldDismissPopover={false} />
			<MenuItem icon="zoom-to-fit" text="Browser" disabled={true} />
			<MenuDivider />
			<MenuItem icon="cog" text="Settings...">
				<MenuItem icon="add" text="Add new application" disabled={true} />
				<MenuItem icon="remove" text="Remove application" />
			</MenuItem>
		</Menu>
	);

	
	
	const image_src = "https://www.thoughtco.com/thmb/HvrGMQjIgp1U-A9vLEjFzMJmKcI=/" +
	"768x0/filters:no_upscale():max_bytes(150000):strip_icc()/antacid-tablet-dissolving-in-glass-of-water-84284196-58a30d095f9b58819ca7dd02.jpg";
	
	const node_img = <img
	className={styles.smaller_img}
	src={image_src} />
	
	const node_spinner = <Spinner
	onClick={() => { console.log('spinner clicked') }}
	onDoubleClick={() => { console.log('spinner double clicked') }}
	className={styles.smaller_img} />
	
	const popover = (
		<Popover content={exampleMenu} fill={true} placement="bottom">
			{node_spinner}
		</Popover>
	);
	const roll_value = data.roll;

	let display_ontent = roll_value % 2 == 0 ? node_img : popover;

	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				style={{ background: '#555' }}
				onConnect={(params) => console.log('handle onConnect', params)}
				isConnectable={true}
			/>
			<div className={styles.nice_box}>
				Custom Color Picker Node: <strong></strong>
				{display_ontent}
			</div>
			<Handle
				type="source"
				position={Position.Right}
				id="a"
				style={{ background: '#555' }}
				isConnectable={true}
			/>
		</>
	);
}

export const CustomNode = memo(_CustomNode);

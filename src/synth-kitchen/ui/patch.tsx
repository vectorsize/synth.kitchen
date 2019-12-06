import * as React from 'react';

import { Connections } from './patch-connections';
import { Connector } from './patch-connector';
import { ModuleType, IModule, IConnector } from '../state/patch';
import { modules } from '../state/module-map';
import { Rack, IRack } from './patch-rack';
import { IEnd, IConnection } from '../state/patch';
import { uniqueId } from '../io/utils/unique-id';
import { DelayModule } from '../state/module-delay';

export interface IConnectPayload {
	connection: IConnection;
	sourceConnector: IConnector;
	destinationConnector: IConnector;
}

export interface IPatchCallbacks {
	connectorActivate: (end: IEnd) => void;
	connectorDeactivate: () => void;
	connectorConnect: (payload: IConnectPayload) => void;
	connectorDisconnect: (payload: IConnectPayload) => void;
	moduleAdd: (moduleType: ModuleType, rackIndex: number, slotIndex: number) => void;
	moduleRackRemove: (rackIndex: number) => void;
	moduleRemove: (moduleKey: string) => void;
	parameterChange: (moduleKey: string, parameterId: string, newValue: any) => void;
}

export interface IPatchState {
	active?: IEnd;
	connections: IConnection[];
	racks: IRack[];
	actions: any[];
}

export const PatchContext = React.createContext<IPatchCallbacks & IPatchState>(
	{
		connectorActivate: () => null,
		connectorDeactivate: () => null,
		connectorConnect: () => null,
		connectorDisconnect: () => null,
		moduleAdd: () => null,
		moduleRackRemove: () => null,
		moduleRemove: () => null,
		parameterChange: () => null,
		connections: [],
		racks: [],
		actions: []
	}
)

export class Patch extends React.Component<{}, IPatchState> {
	constructor(props: any) {
		super(props);

		this.state = {
			connections: [],
			racks: [{ index: 0, moduleKeys: [] }],
			actions: []
		};
	}

	componentDidMount() {
		document.addEventListener('keydown', this.handleKeyDown, false);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown, false);
		this.state.racks.forEach(rack => {
			rack.moduleKeys.forEach(key => {
				this.moduleRemove(key);
			});
		});
	}

	handleKeyDown = (event: KeyboardEvent) => {
		switch (event.which || event.keyCode) {
			case 27:
				if (this.state.active) {
					this.setState({
						active: undefined
					});
				}
		}
	}

	getContextValue = () => {
		return {
			connectorActivate: this.connectorActivate,
			connectorDeactivate: this.connectorDeactivate,
			connectorConnect: this.connectorConnect,
			connectorDisconnect: this.connectorDisconnect,
			moduleAdd: this.moduleAdd,
			moduleRackRemove: this.moduleRackRemove,
			moduleRemove: this.moduleRemove,
			parameterChange: this.parameterChange,
			...this.state
		};
	}

	render() {
		return (
			<PatchContext.Provider value={this.getContextValue()}>
				<button type="button" onClick={() => { console.log([...this.state.actions]); }}>
					log actions
				</button>
				<Connector type="SIGNAL_IN" name={'speakers'} connectorId={'GLOBAL_CONTEXT'} moduleKey={'GLOBAL_CONTEXT'} />
				{this.state.racks.map(rack => (
					<React.Fragment key={rack.index}>
						<Rack {...rack} removeRack={this.moduleRackRemove(rack.index)} addModule={this.moduleAdd} removeModule={this.moduleRemove} />
					</React.Fragment>
				))}
				<button className="add-rack" type="button" onClick={this.moduleRackAdd}>Add Rack</button>
				<Connections moduleCount={modules.size()} rackCount={this.state.racks.length} active={this.state.active} connections={this.state.connections} />
			</PatchContext.Provider>
		)
	}

	connectorActivate = (active: IEnd) => {
		const { actions } = this.state;
		actions.push({
			action: 'connectorActivate',
			payload: active
		});
		this.setState({ active, actions });
	}

	connectorDeactivate = () => {
		const { actions } = this.state;
		actions.push({
			action: 'connectorDeactivate'
		});
		this.setState({ active: undefined, actions });
	}

	connectorConnect = (payload: IConnectPayload) => {
		const { actions } = this.state;
		actions.push({
			action: 'connectorConnect',
			payload
		});
		const { connection, sourceConnector, destinationConnector } = payload;
		sourceConnector.getter().connect(destinationConnector.getter());
		this.setState({
			active: undefined,
			connections: [...this.state.connections, connection],
			actions
		});
	}

	connectorDisconnect = (payload: IConnectPayload) => {
		const { actions } = this.state;
		actions.push({
			action: 'connectorDisconnect',
			payload
		});
		const { connection, sourceConnector, destinationConnector } = payload;
		sourceConnector.getter().disconnect(destinationConnector.getter());
		const connections = this.state.connections.filter(con => (
			con.source.connectorId !== connection.source.connectorId ||
			con.destination.connectorId !== connection.destination.connectorId
		));
		this.setState({
			active: undefined,
			connections,
			actions
		});
	}

	moduleAdd = (moduleType: ModuleType, rackIndex: number, slotIndex: number) => {
		const { actions } = this.state;
		actions.push({
			action: 'moduleAdd',
			payload: {
				moduleType,
				rackIndex,
				slotIndex
			}
		});

		let moduleKey = '';

		/* create a record of the module */
		if (moduleType === 'DELAY') {
			const delay = new DelayModule(moduleType);
			modules.set(delay.moduleKey, delay);
			moduleKey = delay.moduleKey;
		} else {
			const _moduleKey = uniqueId();
			const newModule: IModule = {
				moduleKey: _moduleKey,
				type: moduleType
			};
			moduleKey = _moduleKey;
			modules.set(_moduleKey, newModule);
		}

		/* add the new module to the UI */
		const { racks } = this.state;
		if (rackIndex === this.state.racks.length) {
			const newRack: IRack = {
				index: rackIndex,
				moduleKeys: [moduleKey]
			};
			this.state.racks.push(newRack);
		} else {
			this.state.racks[rackIndex].moduleKeys.splice(slotIndex, 0, moduleKey);
		}
		this.setState({ racks: [...racks], actions });

	}

	moduleClear = (module: IModule) => {
		const { actions } = this.state;
		actions.push({
			action: 'moduleClear',
			payload: module
		});
		this.state.connections.forEach(connection => {
			if (connection.source.moduleKey === module.moduleKey || connection.destination.moduleKey === module.moduleKey) {
				const sourceModule = modules.get(connection.source.moduleKey);
				const destinationModule = modules.get(connection.destination.moduleKey);
				if (sourceModule && destinationModule && sourceModule.connectors && destinationModule.connectors) {
					const sourceConnector = sourceModule.connectors.find(connector => connector.id === connection.source.connectorId);
					const destinationConnector = destinationModule.connectors.find(connector => connector.id === connection.destination.connectorId);
					if (sourceConnector && destinationConnector) {
						this.connectorDisconnect({
							connection,
							sourceConnector,
							destinationConnector
						});
					}
				}
			}
		});
		modules.delete(module.moduleKey);
		this.setState({
			active: undefined,
			actions
		});
	}

	moduleRackAdd = () => {
		const { actions } = this.state;
		actions.push({
			action: 'moduleRackAdd'
		});

		let { racks } = this.state;

		racks.push({
			index: racks.length,
			moduleKeys: []
		});

		this.setState({
			racks,
			actions
		});
	}

	moduleRackRemove = (rackIndex: number) => {
		return () => {
			const { actions } = this.state;
			actions.push({
				action: 'moduleRackRemove',
				payload: rackIndex
			});

			let { racks } = this.state;

			const remove: string[] = [];

			/* collect the keys of modules which need to be removed */
			racks[rackIndex].moduleKeys.forEach(key => {
				remove.push(key);
			});

			/* remove the deleted rack and update rack indices */
			racks = racks.filter(rack => rack.index !== rackIndex);
			racks.forEach((rack, index) => {
				rack.index = index;
			});

			/* clean up the modules in the removed rack */
			this.setState({
				racks: racks.length > 0 ? racks : [{ index: 0, moduleKeys: [] }],
				actions
			}, () => {
				remove.forEach(key => this.moduleRemove(key));
			});

		}
	}

	moduleRemove = (moduleKey: string) => {
		const { actions } = this.state;
		actions.push({
			action: 'moduleRemove',
			payload: moduleKey
		});

		const module = modules.get(moduleKey);
		if (module) {

			/* stop the module if it needs to be stopped */
			if (module.node && module.node.stop) {
				module.node.stop();
			}

			/* remove the module from its rack */
			const racks = this.state.racks.map(rack => ({
				index: rack.index,
				moduleKeys: rack.moduleKeys.filter(key => key !== moduleKey)
			}));

			/* clear the module */
			this.setState({
				racks,
				actions
			}, () => {
				this.moduleClear(module);
			});

		}
	}

	parameterChange = (moduleId: string, parameterId: string, newValue: any) => {
		const { actions } = this.state;
		actions.push({
			action: 'parameterChange',
			payload: {
				moduleId,
				parameterId,
				newValue
			}
		});
		this.setState({ actions });
	}
}

import { IGridModuleProps } from "../components/GridModule";

export interface IModule {
  props: IGridModuleProps;
}

export interface IModuleState {
  module?: IModule;
}

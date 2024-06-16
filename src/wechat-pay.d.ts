declare module 'wechat-pay' {
    import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
    import { HttpService } from '@nestjs/common';
    import { AxiosRequestConfig } from 'axios';
    export interface WechatPayOptions {
      appid: string;
      mch_id: string;
      key: string;
      pfx: string | Buffer;
    }
  
    export interface WechatPayAsyncOptions
      extends Pick<ModuleMetadata, 'imports'> {
      useFactory?: (
        ...args: any[]
      ) => Promise<WechatPayOptions> | WechatPayOptions;
      inject?: any[];
    }
  
    export interface WechatPayModuleOptions extends WechatPayOptions {
      httpsAgent?: any;
    }
  
    export class WechatPayModule {
      static forRoot(options: WechatPayModuleOptions): DynamicModule;
      static forRootAsync(options: WechatPayAsyncOptions): DynamicModule;
    }
  
    export class WechatPayService {
      constructor(httpService: HttpService);
      unifiedOrder(data: any): Promise<any>;
      orderQuery(data: any): Promise<any>;
      closeOrder(data: any): Promise<any>;
      refund(data: any): Promise<any>;
      refundQuery(data: any): Promise<any>;
      downloadBill(data: any): Promise<any>;
      transfers(data: any): Promise<any>;
      getTransferInfo(data: any): Promise<any>;
      sendRedPack(data: any): Promise<any>;
      sendGroupRedPack(data: any): Promise<any>;
      getRedPackInfo(data: any): Promise<any>;
      micropay(data: any): Promise<any>;
      reverse(data: any): Promise<any>;
      authCodeToOpenid(data: any): Promise<any>;
      request(url: string, data?: any, config?: AxiosRequestConfig): Promise<any>;
    }
  }
  
export interface IcpXdrConversionRate {
    xdr_permyriad_per_icp: bigint;
    timestamp_seconds: bigint;
}

export interface IcpXdrConversionResponse {
    data: IcpXdrConversionRate;
}

export interface Cycles {
    get_icp_xdr_conversion_rate: () => Promise<IcpXdrConversionResponse>;
}

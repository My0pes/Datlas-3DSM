export interface IWtssListCoverages {
    coverages?: []
}

export interface IWtssResultQuery {
    coverages: string,
    longitude: number,
    latitude: number,
    start_date: string,
    end_date: string
    attributes?: [],
    timeline?: []
}

export class ApiResponse<T> {
  private data: T | null;
  private message: string;
  private status: boolean;
  private metaPage?: MetaPage;

  constructor(
    data: T | null,
    message: string,
    status: boolean,
    _metaPage?: MetaPage
  ) {
    this.data = data;
    this.message = message;
    this.status = status;
    this.metaPage = _metaPage;
  }

  /**Creates a Successful API Response */
  static success<T>(
    data: T,
    message: "BASE.SUCCESS",
    status: boolean,
    metaPage?: MetaPage
  ): ApiResponse<T> {
    return new ApiResponse(data, message, status, metaPage);
  }

  //*Creates a Failed API Response */
  static error(message: string): ApiResponse<null> {
    return new ApiResponse(null, message, false);
  }
}

export interface MetaPage {
  page: number;
  limit: number;
  total: number;
  isLastPage: boolean;
}

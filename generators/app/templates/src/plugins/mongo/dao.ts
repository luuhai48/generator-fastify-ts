import { AnyBulkWriteOperation } from 'mongodb';
import {
  AnyKeys,
  FilterQuery,
  UpdateQuery,
  Model,
  PipelineStage,
  PopulateOptions,
  ProjectionType,
  SortOrder,
  UpdateWithAggregationPipeline,
  Connection,
  Document,
} from 'mongoose';

import {
  AggregationError,
  BulkWriteError,
  CreateError,
  DeleteError,
  DeleteManyError,
  InsertManyError,
  PopulateError,
  UpdateError,
  UpdateManyError,
} from '@/errors/mongo';

export type FilterArgs<T> = {
  filter: FilterQuery<T>;
  sort?:
    | string
    | { [key: string]: SortOrder | { $meta: 'textScore' } }
    | [string, SortOrder][]
    | undefined
    | null;
  skip?: number;
  limit?: number;
  lean?: boolean;
};

export type GetDocumentsArgs<T> = FilterArgs<T> & {
  projection?: ProjectionType<T> | null | undefined;
  populate?: PopulateOptions | (PopulateOptions | string)[];
};

export type GetDocumentArgs<T> = FilterArgs<T> & {
  projection?: ProjectionType<T> | null | undefined;
  populate?: PopulateOptions | (PopulateOptions | string)[];
};

export type CreateDocumentsArgs<T> = {
  documents: T[];
  populate?: PopulateOptions | Array<PopulateOptions> | string;
};

export type CreateDocumentArgs<T> = {
  document: T | AnyKeys<T>;
  populate?: PopulateOptions | Array<PopulateOptions> | string;
};

export type UpdateDocumentsArgs<T> = {
  filter: FilterQuery<T>;
  update: UpdateQuery<T> | UpdateWithAggregationPipeline;
  populate?: string | PopulateOptions | (PopulateOptions | string)[];
};

export type UpdateDocumentArgs<T> = FilterArgs<T> & {
  update: UpdateQuery<T> | UpdateWithAggregationPipeline;
  upsert?: boolean;
  getNew?: boolean;
  populate?: string | PopulateOptions | (PopulateOptions | string)[];
  projection?: ProjectionType<T> | undefined;
};

export type AggregateArgs = { pipeline: PipelineStage[] };

export type BulkWriteArgs<T> = {
  writes: Array<
    // eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any
    AnyBulkWriteOperation<T extends Document ? any : T extends {} ? T : any>
  >;
};

const collation = { locale: 'en', caseLevel: false, strength: 1 };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_SORT = -1;

export abstract class BaseDao<T> {
  readonly model: Model<T>;

  /**
   * Return a function which returns Model from `mongoose.Connection` and `mongoose.Schema`
   *
   * Example:
   * ```
   * const getCollectionModel = (con: Connection) => con.model('Collection', schema);
   * ...
   * getModel() {
   *   return getCollectionModel;
   * }
   * ...
   * ```
   */
  abstract getModel(): (connection: Connection) => Model<T>;

  constructor(connection: Connection) {
    this.model = this.getModel()(connection);
  }

  async getDocuments<PopulatePaths>(args: GetDocumentsArgs<T>) {
    const {
      filter,
      projection,
      sort,
      skip = 0,
      limit = 0,
      populate,
      lean = false,
    } = args;

    return this.model
      .find(filter, projection, {
        collation,
        sort,
        skip,
        limit,
        lean,
      })
      .populate<PopulatePaths>(
        populate as PopulateOptions | (PopulateOptions | string)[],
      );
  }

  async getPaginatedDocuments({
    page,
    limit,
    sort,
    sortBy,
    ...args
  }: GetDocumentsArgs<T> & {
    page?: number;
    limit?: number;
    sort?: string;
    sortBy?: string;
  }) {
    page = page !== undefined && page > 0 ? page : 1;
    limit =
      limit !== undefined && limit > 0
        ? limit < MAX_LIMIT
          ? limit
          : MAX_LIMIT
        : DEFAULT_LIMIT;
    const sortDirection = sort ? (sort === 'desc' ? -1 : 1) : DEFAULT_SORT;

    const count = await this.count({ filter: args.filter });
    if (!count) return { count: 0, data: [] };

    const data = await this.getDocuments({
      ...args,
      sort: sortBy ? { [sortBy]: sortDirection, _id: 1 } : { _id: 1 },
      limit,
      skip: (page - 1) * limit,
    });
    return { count, data };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPaginatedAggregation<R = any>({
    page,
    limit,
    sort,
    sortBy,
    afterLimit,
    populate,
    noSort,
    ...args
  }: AggregateArgs & {
    page?: number;
    limit?: number;
    sort?: string;
    sortBy?: string;
    afterLimit?: PipelineStage.FacetPipelineStage[];
    populate?: PopulateOptions | Array<PopulateOptions> | string;
    noSort?: boolean;
  }) {
    page = page !== undefined && page > 0 ? page : 1;
    limit =
      limit !== undefined && limit > 0
        ? limit < MAX_LIMIT
          ? limit
          : MAX_LIMIT
        : DEFAULT_LIMIT;
    const sortDirection = sort ? (sort === 'desc' ? -1 : 1) : DEFAULT_SORT;

    const results = (
      await this.aggregate<{ count: { count: number }[]; data: R[] }>({
        ...args,
        pipeline: args.pipeline.concat([
          {
            $facet: {
              count: [{ $count: 'count' }],
              data: [
                ...(noSort
                  ? []
                  : [
                      {
                        $sort: sortBy
                          ? { [sortBy]: sortDirection, _id: 1 }
                          : { _id: 1 },
                      } as PipelineStage.FacetPipelineStage,
                    ]),
                { $skip: (page - 1) * limit },
                { $limit: limit },
                ...(afterLimit || []),
              ],
            },
          },
        ]),
      })
    )[0];

    return {
      count: results?.count?.[0]?.count || 0,
      data: (populate
        ? await this.model.populate(results.data, populate)
        : results.data) as R[],
    };
  }

  async getDocument<PopulatePaths>(args: GetDocumentArgs<T>) {
    const {
      filter,
      projection,
      populate,
      sort,
      skip = 0,
      limit = 0,
      lean = false,
    } = args;
    return this.model
      .findOne(filter, projection, {
        collation,
        sort,
        skip,
        limit,
        lean,
      })
      .populate<PopulatePaths>(
        populate as PopulateOptions | (PopulateOptions | string)[],
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async aggregate<R = any>(args: AggregateArgs) {
    const { pipeline } = args;
    return this.model.aggregate<R>(pipeline, { collation }).catch((e) => {
      throw new AggregationError(e);
    });
  }

  async count(args: FilterArgs<T>) {
    const { filter } = args;
    return this.model.countDocuments(filter, {
      collation,
    });
  }

  async createDocuments(args: CreateDocumentsArgs<T>) {
    const { documents, populate } = args;
    const data = await this.model.insertMany(documents).catch((e) => {
      throw new InsertManyError(e);
    });
    if (populate) {
      return this.model.populate(data, populate).catch((e) => {
        throw new PopulateError(e);
      });
    }
    return data;
  }

  async createDocument(args: CreateDocumentArgs<T>) {
    const { document, populate } = args;
    const data = await this.model.create(document).catch((e) => {
      throw new CreateError(e);
    });
    if (populate) {
      return this.model.populate(data, populate).catch((e) => {
        throw new PopulateError(e);
      });
    }
    return data;
  }

  async updateDocuments<PopulatePaths>(args: UpdateDocumentsArgs<T>) {
    const { filter, update, populate } = args;
    return this.model
      .updateMany(filter, update)
      .populate<PopulatePaths>(
        populate as PopulateOptions | (PopulateOptions | string)[],
      )
      .catch((e) => {
        throw new UpdateManyError(e);
      });
  }

  async updateDocument<PopulatePaths>(args: UpdateDocumentArgs<T>) {
    const {
      filter,
      update,
      sort,
      upsert = false,
      getNew = true,
      populate,
      lean = false,
      projection,
    } = args;
    return this.model
      .findOneAndUpdate(filter, update, {
        upsert,
        new: getNew,
        collation,
        sort,
        lean,
        projection,
      })
      .populate<PopulatePaths>(
        populate as PopulateOptions | (PopulateOptions | string)[],
      )
      .catch((e) => {
        throw new UpdateError(e);
      });
  }

  async bulkWrite(args: BulkWriteArgs<T>) {
    return this.model.bulkWrite(args.writes).catch((e) => {
      throw new BulkWriteError(e);
    });
  }

  async deleteDocuments(args: FilterArgs<T>) {
    const { filter, sort } = args;
    return this.model
      .deleteMany(filter, {
        collation,
        sort,
      })
      .catch((e) => {
        throw new DeleteManyError(e);
      });
  }

  async deleteDocument(args: FilterArgs<T>) {
    const { filter, sort } = args;
    return this.model
      .findOneAndDelete(filter, {
        collation,
        sort,
      })
      .catch((e) => {
        throw new DeleteError(e);
      });
  }
}

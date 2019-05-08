import * as React from 'react';
import { Link } from 'react-router-dom';
import BagManager, { BagFilter, SortOrder } from "model/BagManager";
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import MainPage from "templates/MainPage";
import MainHeader from "templates/MainHeader";
import SideColumn from "templates/SideColumn";
import Content from "templates/Content";
import { RouteComponentProps } from "react-router";
import { BagSummary, BagDetailed, BagStoreDetailed, BagStoreSummary, SimulationSummary, BagExtractionConfiguration, Tag } from "client/api";
import * as moment from 'moment';
import Bag from "pages/Bag";
import SideColumnBagList from "pages/SideColumnBagList";
import BagHeaderBar from "components/BagHeaderBar";
import { TableSortColumnHeader } from "components/TableSortColumnHeader";
import * as Models from "client/api";
import { BrandBlockSearchField } from "components/BrandBlockSearchField";
import { Tags } from "components/Tag";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QueueManager from "model/QueueManager";
import CommentColumn from "components/comment/CommentColumn";
import CommentManager from "model/CommentManager";
import ExtractBagModal from "components/ExtractBagModal";
import { SimulationRequest } from "components/CreateSimulationModal";
import SimManager from "model/SimManager";
import ApiHelper from "client/ApiHelper";

interface Ordering {
  index: number;
  order: SortOrder;
}

interface BagOrdering {
  [index: string]: Ordering;

  name: Ordering;
  duration: Ordering;
  start_time: Ordering;
  size: Ordering;
  discovered: Ordering;
}

function BagTable(props: {
  bags: BagSummary[],
  store: string,
  ordering: BagOrdering,
  onTagClick: (tag: Tag) => void,
  onOrderChange: (order: SortOrder, tag: Ordering) => void
}) {

  const o = props.ordering;

  const rows = props.bags.map((bag) => {
    return <tr key={bag.name}>
      <th scope="row"><Link to={"/bags/" + props.store + "/" + bag.name}>{bag.name}</Link></th>
      <td>{bag.discovered ? moment(bag.discovered).format("MMMM Do YYYY") : "-"}</td>
      <td>{bag.start_time ? moment(bag.start_time).format("MMMM Do YYYY, HH:mm:ss") : "-"}</td>
      <td>{bag.duration ? bag.duration.toFixed(2) : "-"}</td>
      <td>{bag.size ? (bag.size / 1024 / 1024).toFixed(1) : "-"}</td>
      <td>{bag.messages ? (bag.messages / 1000).toFixed(0) + "k" : "-"}</td>
      <td><Tags tags={bag.tags} onClick={props.onTagClick}/></td>
    </tr>;
  });

  return <table className="table table-striped">
    <thead>
    <tr>
      <TableSortColumnHeader tag={o.name} order={o.name.order} onChange={props.onOrderChange}>Name</TableSortColumnHeader>
      <TableSortColumnHeader tag={o.discovered} order={o.discovered.order} onChange={props.onOrderChange}>Discovered</TableSortColumnHeader>
      <TableSortColumnHeader tag={o.start_time} order={o.start_time.order} onChange={props.onOrderChange}>Start Time</TableSortColumnHeader>
      <TableSortColumnHeader tag={o.duration} order={o.duration.order} onChange={props.onOrderChange}>Duration [s]</TableSortColumnHeader>
      <TableSortColumnHeader tag={o.size} order={o.size.order} onChange={props.onOrderChange}>Size [Mb]</TableSortColumnHeader>
      <th scope="col" className=""># Messages</th>
      <th scope="col"></th>
    </tr>
    </thead>
    <tbody>
    {rows}
    </tbody>
  </table>;
}

interface BagStoreContentState {
  bags: BagSummary[];
  bag: BagDetailed;
  stores?: BagStoreSummary[];
  store: BagStoreDetailed;
  ordering?: BagOrdering;
  filter?: BagFilter;
  searchText?: string;

  offset: number;
  loading_more: boolean;
  more_available: boolean;

  saving_tags: boolean;
  saving_description: boolean;

  extract_bag_open: boolean;
}

type BagStoreContentProps = RouteComponentProps<{ store: string, bag?: string }>;

export default class BagStoreContent extends React.Component<BagStoreContentProps, BagStoreContentState> {

  private loadLimit = 25;

  static initialState(): BagStoreContentState {
    return {
      bags: null,
      store: null,
      stores: null,
      bag: null,
      offset: 0,
      more_available: false,
      loading_more: false,
      saving_tags: false,
      saving_description: false,
      searchText: "",
      filter: new BagFilter(),
      extract_bag_open: false,
      ordering: {
        name: {
          index: 0,
          order: SortOrder.None
        },
        duration: {
          index: 0,
          order: SortOrder.None
        },
        start_time: {
          index: 0,
          order: SortOrder.None
        },
        size: {
          index: 0,
          order: SortOrder.None
        },
        discovered: {
          index: 0,
          order: SortOrder.Descending
        }
      }
    };
  }

  static resetState(): BagStoreContentState {
    return {
      bags: null,
      store: null,
      bag: null,
      offset: 0,
      more_available: false,
      loading_more: false,
      saving_tags: false,
      saving_description: false,
      extract_bag_open: false
    };
  }

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = BagStoreContent.initialState();

    // This doesn't change
    BagManager.getBagStores().then((stores) => this.setState({ stores }));

    this.loadModels(this.props.match.params.store, this.props.match.params.bag, true);
  }

  componentWillReceiveProps(nextProps: BagStoreContentProps) {
    this.loadModels(nextProps.match.params.store, nextProps.match.params.bag);
  }

  loadModels(store: string, bag?: string, noClear?: boolean) {
    // Changing stores
    if (!this.state.store || this.state.store.name !== store) {
      noClear || this.setState(BagStoreContent.resetState());
      BagManager.getBagStore(store).then((store) => this.setState({ store }));
      this.reloadBags(store);
    }

    // Do we also load a specific bag?
    if (bag == null) {
      noClear || this.setState({ bag: null });
    } else {
      BagManager.getBagFromStore(store, bag).then((bag) => this.setState({ bag }));
    }
  }

  addLoadedBagsToState(bags: BagSummary[], numberRequested: number, reset: boolean) {
    const moreAvailable = bags.length === numberRequested;

    if (reset) {
      this.setState({ bags, offset: bags.length, more_available: moreAvailable, loading_more: false });
    } else {
      this.setState((prevState, props) => {
        return {
          bags: prevState.bags.concat(bags),
          offset: prevState.offset + bags.length,
          more_available: moreAvailable,
          loading_more: false
        };
      });
    }
  }

  reloadBags(store?: string, newOrdering?: BagOrdering, newFilter?: BagFilter) {
    const storeName = store == null ? this.props.match.params.store : store;
    const ordering = newOrdering == null ? this.state.ordering : newOrdering;
    const filter = newFilter == null ? this.state.filter : newFilter;

    this.setState({ loading_more: true });
    BagManager.getBagsFromStore(storeName, this.loadLimit, 0, this.getOrderingString(ordering), filter)
        .then((bags) => this.addLoadedBagsToState(bags, this.loadLimit, true));
  }

  isLoading(): boolean {
    if (this.props.match.params.bag != null && this.props.match.params.bag !== "") {
      return this.state.bag == null || this.state.store == null || this.state.stores == null;
    } else {
      return this.state.bags == null || this.state.store == null || this.state.stores == null;
    }
  }

  getOrderingString(ordering: BagOrdering): string {
    const orderedColumns: [string, number][] = [];
    for (const columnName in ordering) {
      const column = this.state.ordering[columnName];
      if (column.order === SortOrder.Ascending || column.order === SortOrder.Descending) {
        orderedColumns.push([columnName + ":" + column.order, column.index]);
      }
    }

    return orderedColumns.sort((a, b) => b[1] - a[1]).map((a) => a[0]).join(",");
  }

  /**
   * Load the next x bags
   * @returns {boolean}
   */
  loadNextBags() {
    this.setState({ loading_more: true });
    BagManager.getBagsFromStore(
        this.props.match.params.store,
        this.loadLimit,
        this.state.offset,
        this.getOrderingString(this.state.ordering),
        this.state.filter)
        .then((bags) => this.addLoadedBagsToState(bags, this.loadLimit, false));
  }

  /**
   * This is the render call when we are looking at a specific bag
   * @returns {any}
   */
  renderBagContents() {
    return <React.Fragment><Bag
        storeName={this.props.match.params.store}
        savingTags={this.state.saving_tags}
        savingDescription={this.state.saving_description}
        bag={this.state.bag}
        onTagsChange={this.onTagsChange}
        onToggleTrashClick={this.onToggleTrashClick}
        onTagClick={this.onTagClick}
        onDescriptionChange={this.onDescriptionChange}
        onExtractClick={this.onExtractClick}/>
    </React.Fragment>;
  }

  onTagsChange = (tags: string[]): void => {
    // TODO: Add saving of tags
    this.setState({ saving_tags: true });
    const oldBagName = this.state.bag.name;
    BagManager.setBagTags(this.state.store.name, this.state.bag.name, tags).then((newTags) => {
      toast.success("Tags saved successfully!");

      this.setState(((prevState, props) => {
        // If the bag is still in view update its tags
        if (oldBagName === this.state.bag.name) {
          this.state.bag.tags = newTags;
        }

        // Update the tags of the bag in the side scroll list
        for (const bagSummary of this.state.bags) {
          if (bagSummary.name === oldBagName) {
            bagSummary.tags = newTags;
          }
        }

        return { bags: this.state.bags, bag: this.state.bag, saving_tags: false };
      }));
    });
  };

  onToggleTrashClick = (): void => {
    const inTrash = !this.state.bag.in_trash;
    const oldBagName = this.state.bag.name;

    BagManager.setBagInTrash(this.state.store.name, this.state.bag.name, inTrash).then((newBag) => {
      if (newBag.in_trash) {
        toast.success("Bag put in trash!");
      } else {
        toast.success("Bag taken out of trash!");
      }

      this.setState(((prevState, props) => {
        // If the bag is still in view update its trash status
        if (oldBagName === this.state.bag.name) {
          this.state.bag.in_trash = newBag.in_trash;
        }

        // Update the tags of the bag in the side scroll list
        for (const bagSummary of this.state.bags) {
          if (bagSummary.name === oldBagName) {
            bagSummary.in_trash = newBag.in_trash;
          }
        }

        return { bags: this.state.bags, bag: this.state.bag };
      }));
    }).catch(reason => {
      toast.error("Failure during bag update!");
    });
  };

  onDescriptionChange = (description: string): void => {
    this.setState({ saving_description: true });

    BagManager.setBagDescription(this.state.store.name, this.state.bag.name, description).then((newBag) => {
      toast.success("Description saved successfully!");

      if (newBag.name === this.state.bag.name) {
        this.setState({ bag: newBag, saving_description: false });
      } else {
        this.setState({ saving_description: false });
      }
    });
  };

  onSortOrderChange(order: SortOrder, tag: Ordering) {
    const o = this.state.ordering;

    // TODO: This can no be done without needing to know the columns that can be ordered

    const maxIndex = Math.max(
        o.name.index,
        o.duration.index,
        o.size.index,
        o.start_time.index,
        o.discovered.index);

    const newOrdering: Ordering = { order, index: maxIndex + 1 };

    const newOrderingState = Object.assign(o, {});
    if (tag === o.name) newOrderingState.name = newOrdering;
    if (tag === o.duration) newOrderingState.duration = newOrdering;
    if (tag === o.size) newOrderingState.size = newOrdering;
    if (tag === o.start_time) newOrderingState.start_time = newOrdering;
    if (tag === o.discovered) newOrderingState.discovered = newOrdering;

    this.setState({ ordering: newOrderingState });
    this.reloadBags(null, newOrderingState);
  }

  onIndexClick = (): void => {
    QueueManager.queueStoreIndexTask(this.state.store.name).then((x) => {
      toast.success("Index operation queued successfully!");
    }).catch((x) => {
      if (x.status === 409) {
        toast.warn("Index operation is already queued!");
      } else {
        toast.error("Could not queue the index operation!");
      }
    });
  };

  onCloseExtractionModal = (): void => {
    this.setState({ extract_bag_open: false });
  };

  onSubmitExtraction = (c: BagExtractionConfiguration): void => {
    QueueManager.queueBagExtractionTask(this.state.store.name, this.state.bag.name, c.name).then((task) => {
      toast.success("Extraction of this bag is scheduled!");
    }).catch((x) => {
      if (x.status === 409) {
        toast.warn("Task is already in queue!");
      } else {
        toast.error("Could not queue the extraction task!");
      }
    });
    this.setState({ extract_bag_open: false });
  };

  onExtractClick = (): void => {
    this.setState({ extract_bag_open: true });
  };

  /**
   * This is the render call for looking at the list of bags in the store
   * @returns {any}
   */
  renderBagList() {
    const onChange = this.onSortOrderChange.bind(this);

    let loadMore: any = "No more bags available";

    if (this.state.more_available) {
      if (this.state.loading_more) {
        loadMore = <FoldingCubeSpinner/>;
      } else {
        loadMore = <button type="button" className="btn btn-secondary btn-lg" onClick={this.loadNextBags.bind(this)}>Load More</button>;
      }
    }

    return <React.Fragment>
      <h1 className="rbb-BagStoreContent__title">Bags</h1>
      <h2 className="rbb-BagStoreContent__subtitle">in store '{this.state.store.name}'</h2>
      <div className="rbb-TopButtons rbb-TopButtons--right">
        <button onClick={this.onIndexClick} type="button" className="btn btn-primary btn-sm"><FontAwesomeIcon
            icon={['fas', 'sync']}/> Index
        </button>
      </div>
      <BagTable bags={this.state.bags}
                store={this.props.match.params.store}
                ordering={this.state.ordering}
                onTagClick={this.onTagClick}
                onOrderChange={onChange}/>
      <div className="rbb-BagStoreContent__more">
        {loadMore}
      </div>
    </React.Fragment>;
  }

  renderContent() {
    if (!this.isLoading()) {
      if (this.state.bag != null) {
        return this.renderBagContents();
      } else {
        return this.renderBagList();
      }
    }

    return <FoldingCubeSpinner/>;
  }

  renderColumn() {
    if (this.state.bags !== null && this.state.store) {
      return <SideColumnBagList
          bag={this.state.bag}
          storeName={this.state.store.name}
          moreAvailable={this.state.more_available}
          loadingMore={this.state.loading_more}
          onTagClick={this.onTagClick}
          onRequestMore={this.loadNextBags.bind(this)}>{this.state.bags}</SideColumnBagList>;
    } else {
      return <FoldingCubeSpinner/>;
    }
  }

  renderHeaderBar() {
    return <BagHeaderBar
        stores={this.state.stores ? this.state.stores.map((s) => s.name) : []}
        selectedStore={this.state.store} filter={this.state.filter} onFilterChange={this.onFilterChange}/>;
  }

  onFilterChange = (filter: BagFilter): void => {
    this.setState({ filter });
    this.reloadBags(undefined, undefined, filter);
  }

  onSideColumnScrollEnd = (): void => {
    if (!this.state.loading_more && this.state.more_available && !this.isLoading()) {
      this.loadNextBags();
    }
  }

  searchTimeout: any = null;
  onSearchTextChange = (text: string): void => {
    clearTimeout(this.searchTimeout);

    const components = text.split(" ").map((x) => x.split(":"));
    const filterText = components.filter((x) => x.length === 1).join(' ');
    const filters = components.filter((x) => x.length === 2).map((x) => {
      return { type: x[0], value: x[1] };
    });

    for (const filter of filters) {
      // Tag filtering is now done through the header bar
      // other special filters can be added here.
    }

    this.state.filter.name = filterText;
    this.setState({ filter: this.state.filter, searchText: text });

    const handler = (): void => {
      this.reloadBags();
    };
    this.searchTimeout = setTimeout(handler, 300);
  }

  onTagClick = (tag: Tag): void => {
    if (!this.state.filter.tags ||
        this.state.filter.tags.filter((x) => x === tag.tag).length === 0) {
      const filter = this.state.filter;

      if (!this.state.filter.tags) {
        this.state.filter.tags = [];
      }

      filter.tags.push(tag.tag);
      this.onFilterChange(filter);
    }
  };

  renderRightColumn() {
    if (!this.isLoading()) {
      if (this.state.bag != null) {
        return <CommentColumn topic={CommentManager.getBagCommentTopic(this.state.store.name, this.state.bag.name)}/>;
      }
    }

    return "";
  }

  render() {
    return <React.Fragment><MainPage
        header={<MainHeader brandBlock={<BrandBlockSearchField value={this.state.searchText} onChange={this.onSearchTextChange}/>}
                            subMenu={this.renderHeaderBar()}/>}>
      <Content rightColumn={this.renderRightColumn()}
               leftColumn={<SideColumn onYReachEnd={this.onSideColumnScrollEnd}>{this.renderColumn()}</SideColumn>}>
        <div className="rbb-BagStoreContent">
          {this.renderContent()}
        </div>
      </Content>
    </MainPage>
      <ExtractBagModal onSubmit={this.onSubmitExtraction} onCloseModal={this.onCloseExtractionModal} open={this.state.extract_bag_open}/>
    </React.Fragment>;
  }
}

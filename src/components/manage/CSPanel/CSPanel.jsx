import React, { useState, useEffect, useMemo } from "react";
import { Portal } from "react-portal";
import { defineMessages, useIntl } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Container,
  Segment,
  Checkbox,
  Button,
  Table,
  Loader,
  Form,
  Input,
  Message,
} from "semantic-ui-react";

import { injectLazyLibs } from "@plone/volto/helpers/Loadable/Loadable";
import { Pagination, Toolbar, Unauthorized } from "@plone/volto/components";
import { Helmet, flattenToAppURL } from "@plone/volto/helpers";

import Comments from "./Comments";

import {
  getCustomerSatisfaction,
  deleteFeedbacks,
  resetDeleteFeedbacks,
} from "../../../actions";
import CSPanelMenu from "./CSPanelMenu";
import "./cs-panel.css";

const messages = defineMessages({
  cs_controlpanel: {
    id: "Customer satisfaction",
    defaultMessage: "Customer satisfaction",
  },

  select_item: {
    id: "customer_satisfaction_select_item",
    defaultMessage: "Select item",
  },
  all: {
    id: "customer_satisfaction_all",
    defaultMessage: "All",
  },
  page: {
    id: "customer_satisfaction_page",
    defaultMessage: "Page",
  },
  positive_votes: {
    id: "customer_satisfaction_positive_votes",
    defaultMessage: "Positive votes",
  },
  negative_votes: {
    id: "customer_satisfaction_negative_votes",
    defaultMessage: "Negative votes",
  },
  last_vote: {
    id: "customer_satisfaction_last_vote",
    defaultMessage: "Last vote",
  },
  comments: {
    id: "customer_satisfaction_comments",
    defaultMessage: "Comments",
  },
  filter_title: {
    id: "customer_satisfaction_filter_title",
    defaultMessage: "Filter title",
  },
  items_selected: {
    id: "customer_satisfaction_items_selected",
    defaultMessage: "items selected.",
  },
  reset_feedbacks: {
    id: "customer_satisfaction_reset_feedbacks",
    defaultMessage: "Reset feedbacks",
  },
  confirm_delete_selected: {
    id: "customer_satisfaction_confirm_delete_selected",
    defaultMessage: "Are you sure you want to reset this page's feedbacks?",
  },
});
const CSPanel = ({ moment: Moment }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const location = useLocation();
  const pathname = location.pathname ?? "/";

  const moment = Moment.default;
  moment.locale(intl.locale);

  const [b_size, setB_size] = useState(50);

  const [sort_on, setSort_on] = useState("last_vote");
  const [sort_order, setSort_order] = useState("descending");

  const [currentPage, setCurrentPage] = useState(0);

  const [searchableText, setSearchableText] = useState("");
  const [text, setText] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [itemsSelected, setItemsSelected] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setText(searchableText);
      // Send Axios request here
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchableText]);

  const [viewComments, setViewComments] = useState(null);
  const customerSatisfaction = useSelector(
    (state) => state.getCustomerSatisfaction
  );
  const isUnauthorized = useMemo(
    () =>
      customerSatisfaction?.error &&
      customerSatisfaction?.error?.status === 401,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerSatisfaction?.error]
  );
  const deleteFeedbacksState = useSelector(
    (state) => state.deleteFeedbacks.subrequests
  );

  const deleteFeedbacksEnd =
    Object.keys(deleteFeedbacksState ?? [])?.filter(
      (k) => deleteFeedbacksState[k].loaded === true
    )?.length > 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const doSearch = () => {
    return dispatch(
      getCustomerSatisfaction({
        b_size,
        b_start: currentPage * b_size,
        sort_on,
        sort_order,
        text: text && text.length > 0 ? text + "*" : null,
      })
    );
  };

  useEffect(() => {
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b_size, currentPage, sort_order, sort_on, text]);

  const changeSort = (column) => {
    if (sort_on === column) {
      if (sort_order === "ascending") {
        setSort_order("descending");
      } else {
        setSort_order("ascending");
      }
    } else {
      setSort_on(column);
    }
  };

  const resetFeedbacks = (items) => {
    let items_titles = "";
    items.forEach((i) => {
      items_titles += i.title + "\n";
    });

    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        intl.formatMessage(messages.confirm_delete_selected) +
          "\n" +
          items_titles
      )
    ) {
      // eslint-disable-next-line no-unused-expressions
      items?.forEach((item) => {
        dispatch(deleteFeedbacks(item));
      });
      // doSearch().then(() => {
      //   setItemsSelected([]);
      // });
    }
  };

  useEffect(() => {
    if (deleteFeedbacksEnd) {
      doSearch().then(() => {
        setItemsSelected([]);
      });
      dispatch(resetDeleteFeedbacks());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteFeedbacksEnd]);

  return (
    <>
      {!isUnauthorized ? (
        <Container
          id="page-customer-satisfaction"
          className="controlpanel-customer-satisfaction"
        >
          <Helmet title={intl.formatMessage(messages.cs_controlpanel)} />
          <Segment.Group raised>
            <Segment className="primary">
              {intl.formatMessage(messages.cs_controlpanel)}
            </Segment>

            <CSPanelMenu />
          </Segment.Group>
        </Container>
      ) : (
        <Unauthorized />
      )}
      {isClient && (
        <Portal node={document.getElementById("toolbar")}>
          <Toolbar pathname={pathname} inner={<span />} />
        </Portal>
      )}
    </>
  );
};
export default injectLazyLibs(["moment"])(CSPanel);

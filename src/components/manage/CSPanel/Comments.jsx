import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Label, Segment } from 'semantic-ui-react';
import moment from 'moment';
import { useIntl, defineMessages } from 'react-intl';
import { Icon } from '@plone/volto/components';

import ThumbsUp from '../../../icons/thumbs-up-regular.svg';
import ThumbsDown from '../../../icons/thumbs-down-regular.svg';

const messages = defineMessages({
  close: {
    id: 'customer_satisfaction_close_comments',
    defaultMessage: 'Close',
  },
  comment: {
    id: 'customer_satisfaction_comment',
    defaultMessage: 'Comment',
  },
  date: {
    id: 'customer_satisfaction_comment_date',
    defaultMessage: 'Date',
  },
  positive_votes: {
    id: 'customer_satisfaction_comments_positive_votes',
    defaultMessage: 'Positive votes',
  },
  negative_votes: {
    id: 'customer_satisfaction_comments_negative_votes',
    defaultMessage: 'Negative votes',
  },
  filter: {
    id: 'customer_satisfaction_comments_filter',
    defaultMessage: 'Filter',
  },
});
const Comments = ({ item, onClose = () => {} }) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(null);
  useEffect(() => {
    if (item && item.comments?.length > 0) {
      setOpen(true);
    }
  }, [item, setOpen]);

  const close = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Modal
      onClose={() => close()}
      onOpen={() => setOpen(true)}
      open={open}
      id="customer-satisfaction-comments-modal"
    >
      <Modal.Header>{item?.title}</Modal.Header>
      <Modal.Content>
        {item?.comments && (
          <Segment className="cs-filter">
            {intl.formatMessage(messages.filter)}:{' '}
            <Button
              color="green"
              active={filter === 'ok'}
              content={intl.formatMessage(messages.positive_votes)}
              icon={<Icon name={ThumbsUp} size="15px" />}
              label={{
                basic: true,
                color: 'green',
                pointing: 'left',
                content: item?.comments.filter((c) => c.vote === 'ok').length,
              }}
              size="small"
              onClick={() => {
                filter === 'ok' ? setFilter(null) : setFilter('ok');
              }}
            />
            <Button
              color="red"
              active={filter === 'nok'}
              content={intl.formatMessage(messages.negative_votes)}
              icon={<Icon name={ThumbsDown} size="15px" />}
              label={{
                basic: true,
                color: 'red',
                pointing: 'left',
                content: item?.comments.filter((c) => c.vote === 'nok').length,
              }}
              size="small"
              onClick={() => {
                filter === 'nok' ? setFilter(null) : setFilter('nok');
              }}
            />
          </Segment>
        )}

        <Table selectable compact attached fixed>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={1}></Table.HeaderCell>
              <Table.HeaderCell width={8}>
                {intl.formatMessage(messages.comment)}
              </Table.HeaderCell>
              <Table.HeaderCell width={3}>
                {intl.formatMessage(messages.date)}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {item?.comments
              ?.filter((f) => {
                return filter ? f.vote === filter : true;
              })
              .map((c) => (
                <tr key={c.date}>
                  <Table.Cell>
                    <Label
                      color={c.vote === 'ok' ? 'green' : 'red'}
                      className="vote-label"
                    >
                      <Icon
                        name={c.vote === 'ok' ? ThumbsUp : ThumbsDown}
                        size="15px"
                      />
                    </Label>
                  </Table.Cell>
                  <Table.Cell>{c.comment}</Table.Cell>
                  <Table.Cell>
                    {moment(c.date).format('DD/MM/YYYY HH:mm')}
                  </Table.Cell>
                </tr>
              ))}
          </Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Actions>
        <Button
          color="black"
          onClick={() => {
            close();
          }}
        >
          {intl.formatMessage(messages.close)}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default Comments;
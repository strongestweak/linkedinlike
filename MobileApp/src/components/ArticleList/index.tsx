import {DateTime} from 'luxon';
import {
  ActivityIndicator,
  RefreshControl,
  TouchableNativeFeedback,
} from 'react-native';
import {FlatList, Text, View} from 'native-base';
import React, {FunctionComponent, useCallback, useEffect, useMemo} from 'react';
import {ListRenderItem} from 'react-native/types';
import useArticleStore, {Article} from '../../stores/article';
import {User} from '../../stores/auth';
import {ROUTES, StateLoadingPagination, useNavigation} from '../../utils/types';
import Animated, {FadeInRight, FadeOutRight} from 'react-native-reanimated';
import RenderReact from './RenderReact';

/**
 * ArticleList props
 */
interface Props {
  user?: User;
  ListHeaderComponent?: React.ReactElement;
}

/**
 * ArticleList Component
 */
const ArticleList: FunctionComponent<Props> = ({
  user,
  ListHeaderComponent,
  ...props
}) => {
  const navigation = useNavigation();
  const {fetchArticle, articleList} = useArticleStore();
  const articleState = useMemo<
    StateLoadingPagination<Article[] | undefined> | undefined
  >(() => {
    return articleList[user?.id || 'All'];
  }, [articleList, user?.id]);

  useEffect(() => {
    fetchArticle({userId: user?.id, ignoreLoading: true});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const formatDatePublished = useCallback((date: Date): string | null => {
    if (!date) {
      return null;
    }
    return DateTime.fromJSDate(new Date(date)).toRelative();
  }, []);

  const renderReacts = useCallback(
    ({item}: {item: Article; index: number}) => <RenderReact article={item} />,
    [],
  );

  const renderItem = useCallback<ListRenderItem<Article>>(
    ({item, index}) => {
      return (
        <TouchableNativeFeedback
          onPress={() => {
            navigation.push(ROUTES.ArticleScreen, {
              article: item,
            });
          }}>
          <Animated.View
            entering={FadeInRight.delay((index % 20) * 50)}
            exiting={FadeOutRight}>
            <View
              padding={2}
              borderColor={'coolGray.900'}
              borderBottomWidth={1}>
              <Text
                fontSize="xl"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{flex: 1}}>
                {item.title}
              </Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text fontSize="xs">{`Author: ${item.User?.firstName} ${item.User?.lastName}`}</Text>
                <Text italic fontSize="xs">{`${formatDatePublished(
                  item.datePublished,
                )}`}</Text>
              </View>
              {renderReacts({item, index})}
            </View>
          </Animated.View>
        </TouchableNativeFeedback>
      );
    },
    [formatDatePublished, navigation, renderReacts],
  );

  const onRefresh = useCallback(
    () => fetchArticle({userId: user?.id}),
    [fetchArticle, user?.id],
  );

  const onEndReached = useCallback(() => {
    if (articleState?.pagination) {
      const {count, total, offset} = articleState.pagination;
      console.log('qwe', count < total);
      if (count < total) {
        fetchArticle({userId: user?.id, offset: offset + 20});
      }
    }
  }, [articleState?.pagination, fetchArticle, user?.id]);

  const keyExtractor = useCallback((item: Article, index: number): string => {
    return item.id + '-' + index;
  }, []);

  return (
    <FlatList
      data={articleState?.data || []}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={onEndReached}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        articleState?.isLoading ? (
          <View style={{paddingVertical: 10}}>
            <ActivityIndicator color={'#fff'} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={Boolean(articleState?.isLoading)}
          onRefresh={onRefresh}
          title={articleState?.isLoading ? 'Loading' : 'Pull to refresh'}
          tintColor="#fff"
          titleColor="#fff"
        />
      }
    />
  );
};

export default ArticleList;

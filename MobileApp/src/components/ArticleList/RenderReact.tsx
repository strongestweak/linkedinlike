import {Text, useTheme, View} from 'native-base';
import React, {FunctionComponent, useCallback, useEffect, useMemo} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useArticleStore, {Article, ReactType} from '../../stores/article';
import ReactButtonAnimation from './ReactButtonAnimation';

/**
 * RenderReact props
 */
interface Props {
  article: Article;
  canUpdate?: boolean;
}

/**
 * RenderReact Component
 */
const RenderReact: FunctionComponent<Props> = ({
  article: _article,
  canUpdate,
}) => {
  const {article: articleStateList} = useArticleStore();
  const theme = useTheme();
  const article = useMemo(
    () => articleStateList[_article?.id]?.data || _article,
    [_article, articleStateList],
  );
  const {fetchUserReact, userReact, updateReact, updateReactState} =
    useArticleStore();

  const cUpdateReactState = useMemo(
    () => updateReactState[article.id],
    [article.id, updateReactState],
  );

  const userReactState = useMemo(
    () => userReact[article.id]?.data,
    [article.id, userReact],
  );

  const cUserReact = useMemo<ReactType | undefined>(() => {
    return userReactState?.type;
  }, [userReactState?.type]);

  const likes = useMemo(
    () => article.ArticleUserReact.find(react => react.type === 'like'),
    [article.ArticleUserReact],
  );
  const unlikes = useMemo(
    () => article.ArticleUserReact.find(react => react.type === 'unlike'),
    [article.ArticleUserReact],
  );

  useEffect(() => {
    if (canUpdate) {
      fetchUserReact(article.id);
    }
  }, [article.id, canUpdate, fetchUserReact]);

  const disabled = useMemo(
    () => userReact[article.id]?.isLoading || cUpdateReactState?.isLoading,
    [article.id, cUpdateReactState?.isLoading, userReact],
  );

  const onPressReact = useCallback(
    (type: ReactType) => {
      const isDelete = userReactState?.type === type;
      updateReact(article.id, type, userReactState?.id, isDelete);
    },
    [article.id, updateReact, userReactState?.id, userReactState?.type],
  );

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{marginRight: 3}}>{likes?.count || 0}</Text>
        <ReactButtonAnimation
          onPress={() => onPressReact('like')}
          style={{padding: canUpdate ? 5 : 0, opacity: disabled ? 0.25 : 1}}
          disabled={!canUpdate && !disabled}>
          <Icon
            name="thumb-up"
            color={cUserReact === 'like' ? theme.colors.primary[500] : '#fff'}
            size={canUpdate ? 24 : 12}
          />
        </ReactButtonAnimation>
      </View>
      <Text style={{marginLeft: 4, marginRight: 4, opacity: 0.5}}>|</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{marginRight: 3}}>{unlikes?.count || 0}</Text>
        <ReactButtonAnimation
          style={{padding: canUpdate ? 5 : 0, opacity: disabled ? 0.25 : 1}}
          onPress={() => onPressReact('unlike')}
          disabled={!canUpdate && !disabled}>
          <Icon
            name="thumb-down"
            color={cUserReact === 'unlike' ? theme.colors.primary[500] : '#fff'}
            size={canUpdate ? 24 : 12}
          />
        </ReactButtonAnimation>
      </View>
    </View>
  );
};

export default RenderReact;

import {Text, View} from 'native-base';
import React, {FunctionComponent} from 'react';
import ArticleList from '../../components/ArticleList';

export interface HomeScreenParams {}

/**
 * HomeScreen props
 */
interface HomeScreenProps {
  routes?: {params: HomeScreenParams};
}

/**
 * HomeScreen Component
 */
const HomeScreen: FunctionComponent<HomeScreenProps> = () => {
  return (
    <>
      <ArticleList />
    </>
  );
};

export default HomeScreen;
